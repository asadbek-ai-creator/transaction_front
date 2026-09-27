import AlertForm from "@/components/AlertForm";
import ApiStatus from "@/components/ApiStatus";
import BatchUpload from "@/components/BatchUpload";
import LiveDemo from "@/components/LiveDemo";
import ModelOverview from "@/components/ModelOverview";
import Tabs from "@/components/Tabs";
import Icon, { type IconName } from "@/components/ui/Icon";

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "list",
    title: "Введите транзакции",
    text: "Операции клиента до даты оповещения — вручную или файлом.",
  },
  {
    icon: "cpu",
    title: "Модель анализирует",
    text: "Считает 79 признаков: суммы, наличные, ночные операции и др.",
  },
  {
    icon: "target",
    title: "Получите оценку",
    text: "Вероятность эскалации, уровень риска и рекомендацию.",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Icon name="shield" size={20} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-text">IT-Ledi</div>
              <div className="text-xs text-text-muted">Скоринг AML-оповещений</div>
            </div>
          </div>
          <ApiStatus />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <section className="mb-8">
          <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Какие оповещения стоит передать на расследование?
          </h1>
          <p className="mt-2 max-w-2xl text-base text-text-muted">
            Сервис оценивает вероятность того, что оповещение финансового мониторинга будет
            эскалировано, по истории транзакций клиента. Это помогает аналитику начать с самых
            рискованных случаев.
          </p>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3 rounded-xl border border-line bg-white/70 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
                  <Icon name={s.icon} size={18} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-text">
                    <span className="text-brand-700">{i + 1}.</span> {s.title}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Tabs
          tabs={[
            {
              id: "single",
              label: "Одно оповещение",
              description: "Ввести транзакции вручную и получить оценку",
              icon: "search",
              content: <AlertForm />,
            },
            {
              id: "batch",
              label: "Пакетная проверка",
              description: "Загрузить CSV-файлы и оценить много оповещений",
              icon: "layers",
              content: <BatchUpload />,
            },
            {
              id: "model",
              label: "О модели",
              description: "Как работает модель и насколько ей доверять",
              icon: "chart",
              content: <ModelOverview />,
            },
            {
              id: "live",
              label: "Живое демо",
              description: "Отправить перевод с телефона и увидеть оценку",
              icon: "phone",
              content: <LiveDemo />,
            },
          ]}
        />
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-text-subtle sm:flex-row sm:justify-between sm:px-6">
          <span>Модель — вспомогательный инструмент. Окончательное решение принимает аналитик.</span>
          <span>Синтетические данные · не отражают реальных клиентов · Команда IT-Ledi</span>
        </div>
      </footer>
    </>
  );
}
