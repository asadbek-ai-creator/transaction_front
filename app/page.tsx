import AlertForm from "@/components/AlertForm";
import ApiStatus from "@/components/ApiStatus";
import BatchUpload from "@/components/BatchUpload";
import LiveDemo from "@/components/LiveDemo";
import ModelOverview from "@/components/ModelOverview";
import Tabs from "@/components/Tabs";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-10 flex flex-col gap-4 border-b border-ink-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium tracking-wide text-brass">Команда IT-Ledi</p>
          <h1 className="text-2xl font-semibold text-paper sm:text-3xl">
            Скоринг эскалации оповещений
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-paper-muted">
            Оценка вероятности того, что оповещение финансового мониторинга будет передано на
            расследование, на основе истории транзакций клиента.
          </p>
        </div>
        <ApiStatus />
      </header>

      <Tabs
        tabs={[
          {
            id: "single",
            label: "Один сигнал",
            content: <AlertForm />,
          },
          {
            id: "batch",
            label: "Пакетная загрузка",
            content: <BatchUpload />,
          },
          {
            id: "model",
            label: "О модели",
            content: <ModelOverview />,
          },
          {
            id: "live",
            label: "Живой демо",
            content: <LiveDemo />,
          },
        ]}
      />

      <footer className="mt-16 border-t border-ink-border pt-6 text-xs text-paper-dim">
        Синтетические данные · не отражают реальных клиентов или транзакции
      </footer>
    </main>
  );
}
