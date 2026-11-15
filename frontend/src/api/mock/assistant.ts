import { addDays, toIsoDate } from "../../lib/dates";
import type { ChatResponse, Checklist, TimeOffDraft } from "../schemas";
import { knowledgeFor, type KnowledgeEntry, type MockUser } from "./data";

export type AssistantContext = {
  user: MockUser;
  message: string;
  checklist: Checklist;
  others: MockUser[];
  now: Date;
};

const timeOffTopic = /отгул|отпроси|выходн(ой|ого|ые)|не\s+(приду|выйду)/;
const requestWords = /хочу|нужен|нужна|нужно|оформи|возьму|можно|запиши|сделай|создай|подай/;
const procedureWords = /(^|\s)как(\s|$)|порядок|правил|что\s+нужно/;
const personalDataWords = /заявк|отгул|дел[аио]|задач|маршрут|чек-?лист|прогресс/;
const nextStepWords = /дальше|следующ|что\s+делать|с\s+чего\s+начать|план/;
const greetingWords = /^(привет|здравствуй|добрый)/;

const monthPattern =
  "(январ[яь]|феврал[яь]|марта?|апрел[яь]|ма[йя]|июн[яь]|июл[яь]|августа?|сентябр[яь]|октябр[яь]|ноябр[яь]|декабр[яь])";
const monthMatchers = [
  /^январ/,
  /^феврал/,
  /^март/,
  /^апрел/,
  /^ма[йя]$/,
  /^июн/,
  /^июл/,
  /^август/,
  /^сентябр/,
  /^октябр/,
  /^ноябр/,
  /^декабр/,
];
const weekdayMatchers: Array<[RegExp, number]> = [
  [/воскресень/, 0],
  [/понедельник/, 1],
  [/вторник/, 2],
  [/сред[уа]/, 3],
  [/четверг/, 4],
  [/пятниц[уа]/, 5],
  [/суббот[уа]/, 6],
];

function normalize(message: string): string {
  return message.toLowerCase().replaceAll("ё", "е").trim();
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`(^|[^а-яa-z])${word}([^а-яa-z]|$)`).test(text);
}

function monthIndex(word: string): number {
  return monthMatchers.findIndex((matcher) => matcher.test(word));
}

function dateIn(now: Date, month: number, day: number, year?: number): Date | null {
  const today = addDays(now, 0);
  let date = new Date(year ?? now.getFullYear(), month, day);
  if (date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  if (year === undefined && date < today) {
    date = new Date(now.getFullYear() + 1, month, day);
  }
  return date;
}

function single(date: Date): TimeOffDraft {
  const iso = toIsoDate(date);
  return { dateFrom: iso, dateTo: iso };
}

export function nextWorkday(now: Date): Date {
  let date = addDays(now, 1);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date = addDays(date, 1);
  }
  return date;
}

export function parseTimeOffDates(message: string, now: Date): TimeOffDraft | null {
  const text = normalize(message);

  const range = text.match(new RegExp(`с\\s+(\\d{1,2})(?:\\s+${monthPattern})?\\s+по\\s+(\\d{1,2})\\s+${monthPattern}`));
  if (range) {
    const toMonth = monthIndex(range[4]);
    const fromMonth = range[2] ? monthIndex(range[2]) : toMonth;
    const from = dateIn(now, fromMonth, Number(range[1]));
    const to = dateIn(now, toMonth, Number(range[3]));
    if (from && to) {
      return { dateFrom: toIsoDate(from), dateTo: toIsoDate(to < from ? from : to) };
    }
  }

  const numeric = text.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?/);
  if (numeric) {
    const date = dateIn(now, Number(numeric[2]) - 1, Number(numeric[1]), numeric[3] ? Number(numeric[3]) : undefined);
    return date ? single(date) : null;
  }

  const named = text.match(new RegExp(`(\\d{1,2})\\s+${monthPattern}`));
  if (named) {
    const date = dateIn(now, monthIndex(named[2]), Number(named[1]));
    return date ? single(date) : null;
  }

  if (text.includes("послезавтра")) return single(addDays(now, 2));
  if (text.includes("завтра")) return single(addDays(now, 1));
  if (text.includes("сегодня")) return single(addDays(now, 0));

  for (const [matcher, weekday] of weekdayMatchers) {
    if (matcher.test(text)) {
      const diff = (weekday - now.getDay() + 7) % 7 || 7;
      return single(addDays(now, diff));
    }
  }
  return null;
}

function bestEntry(entries: KnowledgeEntry[], text: string): KnowledgeEntry | null {
  let best: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const entry of entries) {
    const score = entry.keywords.filter((keyword) => text.includes(keyword)).length;
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best;
}

function textReply(text: string, sources: string[]): ChatResponse {
  return { mode: "fallback", reply: { type: "text", text, sources } };
}

export function answer(ctx: AssistantContext): ChatResponse {
  const text = normalize(ctx.message);
  const knowledge = knowledgeFor(ctx.user);

  const other = ctx.others.find((user) => user.nameForms.some((form) => hasWord(text, form)));
  if (other && personalDataWords.test(text)) {
    return textReply("Я вижу только ваши дела и заявки. Данные других сотрудников показать не могу.", []);
  }

  if (timeOffTopic.test(text)) {
    const range = parseTimeOffDates(text, ctx.now);
    const wantsRequest = range !== null || (requestWords.test(text) && !procedureWords.test(text));
    if (wantsRequest) {
      const intro = range
        ? "Подготовил заявку на отгул в сервис «Отсутствия»."
        : "Дату не нашёл, поставил ближайший рабочий день.";
      return {
        mode: "fallback",
        reply: {
          type: "time_off_draft",
          text: `${intro} Проверьте даты и нажмите «Отправить заявку» — её согласует ${ctx.user.leadName}. Причину указывать не нужно.`,
          draft: range ?? single(nextWorkday(ctx.now)),
        },
      };
    }
    const procedure = knowledge.find((entry) => entry.topic === "Отгул");
    if (procedure) {
      return textReply(
        `${procedure.text} Напишите, на какой день нужен отгул, и я подготовлю заявку.`,
        [procedure.source],
      );
    }
  }

  if (nextStepWords.test(text)) {
    const next = ctx.checklist.nextStep;
    return textReply(
      next
        ? `Следующий шаг: ${next.title.toLowerCase()}. Отметьте пункт в маршруте, когда закончите.`
        : "Все пункты маршрута пройдены. Обсудите с наставником следующие цели.",
      ["Ваш маршрут адаптации"],
    );
  }

  const entry = bestEntry(knowledge, text);
  if (entry) {
    return textReply(entry.text, [entry.source]);
  }

  if (greetingWords.test(text)) {
    return textReply("Привет! Спросите про стендапы, задачи или доступы — или напишите, на какой день нужен отгул.", []);
  }

  return textReply(
    `В шпаргалке команды этого нет, а выдумывать я не буду. Лучше спросить наставника: ${ctx.user.buddyName}.`,
    [],
  );
}
