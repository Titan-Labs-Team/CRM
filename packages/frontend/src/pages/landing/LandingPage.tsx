import { useNavigate } from 'react-router-dom';
import {
  Kanban,
  Users,
  BarChart3,
  Zap,
  Key,
  UserCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LogoIcon } from '@/components/ui/LogoIcon';

const features = [
  {
    icon: Kanban,
    title: 'Pipeline Kanban',
    description: 'Visualize e mova negócios entre etapas com drag-and-drop. Cada pipeline configurado do seu jeito.',
  },
  {
    icon: Users,
    title: 'Gestão de Contatos',
    description: 'Centralize leads, contatos e clientes. Filtre, pesquise e exporte em CSV quando precisar.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e Métricas',
    description: 'Dashboard com KPIs em tempo real, funil de vendas, ranking de vendedores e receita por período.',
  },
  {
    icon: Zap,
    title: 'Automações / Webhooks',
    description: 'Dispare eventos para seus sistemas externos com payloads HMAC assinados sempre que um negócio mudar.',
  },
  {
    icon: Key,
    title: 'API Pública',
    description: 'Acesse contatos e negócios via API REST com chaves seguras. Integre com qualquer ferramenta.',
  },
  {
    icon: UserCheck,
    title: 'Multi-usuário',
    description: 'Convide sua equipe com papéis distintos — Vendedor, Gerente e Admin. Cada um vê o que precisa.',
  },
];

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para começar e validar seu processo de vendas.',
    cta: 'Começar grátis',
    ctaPlan: null as null | 'starter' | 'pro',
    highlight: false,
    features: [
      'Até 3 usuários',
      'Pipeline Kanban',
      'Contatos ilimitados',
      'Dashboard e KPIs',
      'Calendário de atividades',
      '100 requisições de API/dia',
    ],
  },
  {
    name: 'Starter',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para times pequenos que precisam de mais controle.',
    cta: 'Assinar Starter',
    ctaPlan: 'starter' as const,
    highlight: false,
    features: [
      'Até 10 usuários',
      'Tudo do Free',
      'Webhooks e Integrações',
      'Chaves de API',
      '1.000 requisições de API/dia',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para equipes em crescimento com foco em dados.',
    cta: 'Assinar Pro',
    ctaPlan: 'pro' as const,
    highlight: true,
    features: [
      'Usuários ilimitados',
      'Tudo do Starter',
      'Importação CSV de contatos',
      'Exportação CSV de negócios',
      'Campos personalizados',
      '10.000 requisições de API/dia',
    ],
  },
];

const testimonials = [
  {
    name: 'Rafael Oliveira',
    role: 'Diretor Comercial, Agência Acelera',
    text: 'Finalmente saímos do WhatsApp e das planilhas. O Titan Labs organizou todo o nosso funil em menos de um dia.',
    stars: 5,
  },
  {
    name: 'Camila Torres',
    role: 'Head de Vendas, SaaS B2B',
    text: 'Os relatórios de leaderboard motivaram a equipe inteira. Nunca tivemos tanta clareza sobre o funil.',
    stars: 5,
  },
  {
    name: 'Bruno Mendes',
    role: 'Fundador, Consultoria Digital',
    text: 'Setup em minutos, API bem documentada e webhooks que funcionam de verdade. Recomendo.',
    stars: 5,
  },
];

const faqs = [
  {
    q: 'Preciso de cartão de crédito para o plano Free?',
    a: 'Não. O plano Free é gratuito para sempre, sem cartão de crédito. Você só precisa criar uma conta.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Você pode cancelar sua assinatura a qualquer momento pelo painel de configurações. Não há multa ou fidelidade.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Cada workspace é completamente isolado. Nenhum dado de um cliente é visível para outro. Usamos PostgreSQL com backups automáticos.',
  },
  {
    q: 'Posso migrar meus contatos de outra ferramenta?',
    a: 'Sim, no plano Pro você pode importar contatos via CSV. Para migrações maiores, entre em contato com nosso suporte.',
  },
  {
    q: 'Há limite de contatos ou negócios?',
    a: 'Não. Todos os planos têm contatos e negócios ilimitados. Os limites são apenas no número de usuários e chamadas de API.',
  },
  {
    q: 'Vocês têm API pública?',
    a: 'Sim. A partir do plano Starter você pode criar chaves de API e acessar contatos e negócios via REST.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-bg-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-text-primary hover:bg-bg-surface transition-colors"
      >
        <span className="font-medium">{q}</span>
        {open ? <ChevronUp size={16} className="text-text-secondary flex-shrink-0" /> : <ChevronDown size={16} className="text-text-secondary flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-text-secondary text-sm leading-relaxed border-t border-bg-border">
          {a}
        </div>
      )}
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const handleCta = (plan?: 'starter' | 'pro' | null) => {
    if (accessToken) {
      navigate('/dashboard');
      return;
    }
    if (plan) {
      navigate(`/register?plan=${plan}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-primary/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon size={22} />
            <span className="font-semibold text-sm">Titan Labs</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Planos</a>
            <a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => handleCta()}
              className="text-sm px-4 py-1.5 rounded-lg bg-accent-green text-bg-primary font-semibold hover:bg-accent-green-dim transition-colors"
            >
              Começar grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-medium mb-8">
          <Zap size={12} />
          Novo: Webhooks com assinatura HMAC
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          O CRM que sua equipe<br />
          <span className="text-accent-green">realmente vai usar</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10">
          Substitua WhatsApp e planilhas por um pipeline visual, relatórios em tempo real e uma API pronta para integrar com qualquer ferramenta.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleCta()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-green text-bg-primary font-semibold hover:bg-accent-green-dim transition-colors text-base"
          >
            Começar grátis
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl border border-bg-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors text-base"
          >
            Já tenho conta
          </button>
        </div>
        <p className="text-xs text-text-muted mt-4">Sem cartão de crédito · Setup em menos de 5 minutos</p>

        {/* Mock screenshot */}
        <div className="mt-16 rounded-2xl border border-bg-border bg-bg-surface overflow-hidden shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-bg-border bg-bg-darker">
            <span className="w-3 h-3 rounded-full bg-status-lost/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-status-won/60" />
          </div>
          <div className="flex gap-px bg-bg-border overflow-x-auto">
            {['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'].map((stage, i) => (
              <div key={stage} className="flex-1 min-w-[140px] bg-bg-surface p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{stage}</span>
                  <span className="text-xs text-text-muted">{[4, 3, 5, 2, 3][i]}</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: [4, 3, 5, 2, 3][i] }).map((_, j) => (
                    <div key={j} className="rounded-lg bg-bg-primary border border-bg-border p-2.5">
                      <div className="h-2.5 bg-bg-border rounded w-3/4 mb-1.5" />
                      <div className="h-2 bg-bg-border rounded w-1/2 opacity-60" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain / Solution */}
      <section className="bg-bg-surface border-y border-bg-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-10">Do caos para o controle</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { before: 'Leads perdidos no WhatsApp', after: 'Pipeline visual centralizado' },
              { before: 'Planilhas desatualizadas', after: 'Dados em tempo real com histórico' },
              { before: 'Sem visibilidade do time', after: 'Relatórios e ranking de vendedores' },
            ].map(({ before, after }) => (
              <div key={before} className="flex flex-col items-center gap-3">
                <div className="text-sm text-status-lost bg-status-lost/10 border border-status-lost/20 rounded-lg px-4 py-2 w-full text-center">
                  ✗ {before}
                </div>
                <ArrowRight size={14} className="text-text-muted rotate-90" />
                <div className="text-sm text-accent-green bg-accent-green/10 border border-accent-green/20 rounded-lg px-4 py-2 w-full text-center">
                  ✓ {after}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Tudo que sua equipe de vendas precisa</h2>
          <p className="text-text-secondary">Ferramentas simples e poderosas em um único lugar.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-5 rounded-xl bg-bg-surface border border-bg-border hover:border-accent-green/30 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-green/10 flex items-center justify-center mb-4 group-hover:bg-accent-green/20 transition-colors">
                <Icon size={18} className="text-accent-green" />
              </div>
              <h3 className="font-semibold mb-1.5">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-bg-surface border-y border-bg-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">O que nossos clientes dizem</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="p-5 rounded-xl border border-bg-border bg-bg-primary">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-text-muted">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Planos simples e transparentes</h2>
          <p className="text-text-secondary">Comece grátis. Escale quando precisar.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col gap-5 ${
                plan.highlight
                  ? 'border-accent-green bg-accent-green/5 shadow-lg shadow-accent-green/10'
                  : 'border-bg-border bg-bg-surface'
              }`}
            >
              {plan.highlight && (
                <div className="text-center">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent-green text-bg-primary">
                    MAIS POPULAR
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-text-muted text-xs mt-1">{plan.description}</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-text-muted text-sm pb-0.5">{plan.period}</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check size={14} className="text-accent-green flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCta(plan.ctaPlan)}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-accent-green text-bg-primary hover:bg-accent-green-dim'
                    : 'border border-bg-border text-text-primary hover:bg-bg-border'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-bg-surface border-y border-bg-border py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Perguntas frequentes</h2>
          <div className="space-y-2">
            {faqs.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para organizar seu time de vendas?</h2>
        <p className="text-text-secondary mb-8">
          Crie sua conta grátis em menos de 2 minutos. Sem cartão de crédito.
        </p>
        <button
          onClick={() => handleCta()}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent-green text-bg-primary font-semibold hover:bg-accent-green-dim transition-colors text-base mx-auto"
        >
          Começar grátis agora
          <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoIcon size={18} />
            <span className="text-sm text-text-secondary">Titan Labs CRM</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="#" className="hover:text-text-secondary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Privacidade</a>
            <a href="mailto:contato@titanlabs.com.br" className="hover:text-text-secondary transition-colors">Contato</a>
          </div>
          <p className="text-xs text-text-muted">© {new Date().getFullYear()} Titan Labs. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
