import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <div className="pagina-form">
      <section className="intro">
        <h1>Conte o que você precisa resolver</h1>
        <p>Nosso time comercial lê cada mensagem e responde por e-mail. Quanto mais contexto, mais útil será a resposta.</p>
      </section>
      <LeadForm />
    </div>
  );
}
