import type { ItemStatus, Stage, User } from "../schemas";

export type TeamId = "search" | "delivery";

export type MockUser = User & {
  login: string;
  password: string;
  leadName: string;
  teamId: TeamId;
  nameForms: string[];
};

export type KnowledgeEntry = {
  topic: string;
  keywords: string[];
  text: string;
  source: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "u-masha",
    login: "маша",
    password: "123",
    name: "Маша",
    role: "intern",
    team: "команда поиска",
    teamId: "search",
    buddyName: "Ольга Смирнова",
    leadName: "Анна Волкова",
    nameForms: ["маша", "маши", "маше", "машу", "машей"],
  },
  {
    id: "u-petya",
    login: "петя",
    password: "123",
    name: "Петя",
    role: "intern",
    team: "команда доставки",
    teamId: "delivery",
    buddyName: "Илья Кузнецов",
    leadName: "Сергей Орлов",
    nameForms: ["петя", "пети", "пете", "петю", "петей"],
  },
];

export const stageTemplate: Stage[] = [
  {
    id: "week-1",
    title: "Неделя 1",
    period: "знакомство",
    items: [
      { id: "team", title: "Познакомиться с командой", status: "todo" },
      { id: "chats", title: "Попросить наставника добавить в рабочие чаты и каналы", status: "todo" },
      { id: "access", title: "Запросить доступ в пространство команды и изучить его", status: "todo" },
      { id: "notes", title: "Обсудить с наставником первые встречи и завести конспект", status: "todo" },
    ],
  },
  {
    id: "week-2",
    title: "Неделя 2",
    period: "погружение",
    items: [
      { id: "progress-tool", title: "Внести цели и ожидания в инструмент отслеживания прогресса", status: "todo" },
      { id: "docs", title: "Изучить документы и мануалы команды", status: "todo" },
    ],
  },
  {
    id: "month-1",
    title: "Месяц 1",
    period: "правила компании",
    items: [{ id: "data-protection", title: "Изучить основы защиты персональных данных", status: "todo" }],
  },
  {
    id: "equator",
    title: "После трёх месяцев",
    period: "экватор",
    items: [
      { id: "equator-prep", title: "Подготовиться к экваторной встрече", status: "todo" },
      { id: "equator-talk", title: "Представить промежуточные результаты на экваторе", status: "todo" },
    ],
  },
];

export const initialStatuses: Record<string, Record<string, ItemStatus>> = {
  "u-masha": { team: "done", chats: "done", access: "in_progress" },
  "u-petya": { team: "done" },
};

type TeamFacts = {
  title: string;
  standup: string;
  board: string;
  repoGroup: string;
  buddy: string;
  oneOnOne: string;
  lead: string;
  chat: string;
};

const avitoChecklist = "Чек-лист стажёра Авито";

function teamKnowledge(facts: TeamFacts): KnowledgeEntry[] {
  const source = `Тестовая шпаргалка ${facts.title}`;
  return [
    {
      topic: "Стендапы",
      keywords: ["стендап", "дейли", "daily", "созвон", "планерк"],
      source,
      text: `Стендап ${facts.title} — каждый будний день в ${facts.standup}, 15 минут. Ссылка есть во встрече в календаре. Коротко расскажите, что сделано вчера, что в работе сегодня и что мешает.`,
    },
    {
      topic: "Задачи",
      keywords: ["задач", "jira", "джир", "тикет", "доск", "таск"],
      source,
      text: `Задачи ${facts.title} лежат на доске ${facts.board} в Jira. Первую задачу выдаёт наставник, она помечена меткой intern.`,
    },
    {
      topic: "Доступы",
      keywords: ["доступ", "confluence", "конфлюенс", "gitlab", "гитлаб", "пространств"],
      source,
      text: `Доступы запрашиваются на портале доступов: пространство команды в Confluence, доска ${facts.board} в Jira и группа ${facts.repoGroup} в GitLab. Если заявка висит дольше двух рабочих дней, напишите наставнику.`,
    },
    {
      topic: "Наставник",
      keywords: ["наставник", "бадди", "buddy", "1:1", "один на один", "ментор"],
      source,
      text: `Ваш наставник — ${facts.buddy}. Встречи 1:1 проходят ${facts.oneOnOne}. Вопросы, на которые нет ответа в шпаргалке, лучше задавать наставнику.`,
    },
    {
      topic: "Отгул",
      keywords: ["отгул", "отпроси", "выходн"],
      source,
      text: `Отгул оформляется заявкой в сервисе «Отсутствия»: нужны только даты, причину указывать не нужно. Заявку согласует ${facts.lead}. Если пропускаете стендап, предупредите команду в чате ${facts.chat}.`,
    },
    {
      topic: "Экватор",
      keywords: ["экватор", "промежуточн", "презентац"],
      source: avitoChecklist,
      text: "Экваторная встреча проходит после трёх месяцев стажировки. Приглашения на подготовительные мастер-классы придут в календарь, презентацию нужно согласовать с куратором стажировки и наставником.",
    },
    {
      topic: "Защита данных",
      keywords: ["персональн", "защит", "конфиденциальн", "безопасн"],
      source: avitoChecklist,
      text: "В первый месяц изучите лендинг «Защита данных», памятку по раскрытию информации и политику по работе с конфиденциальной информацией.",
    },
  ];
}

const knowledge: Record<TeamId, KnowledgeEntry[]> = {
  search: teamKnowledge({
    title: "команды поиска",
    standup: "11:00",
    board: "SEARCH",
    repoGroup: "search",
    buddy: "Ольга Смирнова",
    oneOnOne: "по вторникам в 16:00",
    lead: "руководитель команды Анна Волкова",
    chat: "#search-team",
  }),
  delivery: teamKnowledge({
    title: "команды доставки",
    standup: "10:30",
    board: "DLV",
    repoGroup: "delivery",
    buddy: "Илья Кузнецов",
    oneOnOne: "по четвергам в 15:00",
    lead: "руководитель команды Сергей Орлов",
    chat: "#delivery-team",
  }),
};

export function knowledgeFor(user: MockUser): KnowledgeEntry[] {
  return knowledge[user.teamId];
}
