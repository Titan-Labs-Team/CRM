# Product

## Register

brand

## Users

Donos de PMEs, gerentes comerciais e vendedores no Brasil. Contexto: usam WhatsApp e planilhas para gerir vendas, sentem a dor da desorganização, mas não têm budget para Salesforce. Descobrem o TitanFlow buscando alternativas acessíveis. Chegam na landing desconfiantes — já viram muita ferramenta promissora que decepcionou.

## Product Purpose

TitanFlow é um CRM Kanban-first para times de vendas de PMEs brasileiras. Substitui a bagunça de WhatsApp + planilha por um sistema centralizado com pipeline visual, relatórios e automações. Sucesso = visitante que chega cético sair convencido de que é simples, profissional e feito para ele.

## Brand Personality

Assertivo, preciso, brasileiro sem ser informal demais. Três palavras: **confiante, direto, moderno**.

Referência estética declarada: Framer.com — visual com impacto dramático, hero cinemático, movimento expressivo no scroll, gradientes escuros, mockup animado do produto.

## Anti-references

- Pipedrive / HubSpot: visual de anos 2010, azul corporativo, estático, "enterprise sem alma"
- Salesforce: pesado, intimidante, caro demais no visual
- Planilha-feel: qualquer coisa que pareça Excel/Google Sheets
- SaaS-genérico brasileiro: fundo branco, hero com ícones Flaticon, seção "Por que escolher a gente?" com 3 bullets

## Design Principles

1. **Mostre antes de explicar.** O produto é visual — o Kanban e os gráficos são a prova. Coloque o mockup em primeiro plano, não bullet points.
2. **Cada seção tem um trabalho.** Hero converte, Features provam, Preços decidem. Nenhuma seção repete o trabalho da anterior.
3. **Movimento com intenção.** Animações existem para guiar atenção e revelar o produto, não para impressionar. GSAP ScrollTrigger direcional; zero bounce ou elastic.
4. **Brasileiro sem condescendência.** Copy direto, em português claro, sem exagero de exclamações ou informalidade forçada.
5. **Dark, mas não genérico.** O dark existe porque CRM é ferramenta de trabalho intenso — tela escura = menos fadiga. Justificado pela cena de uso, não por moda.

## Accessibility & Inclusion

- WCAG AA mínimo para contraste de texto
- `prefers-reduced-motion`: desabilitar GSAP e usar simples opacity fade
- Fonte legível em telas pequenas (mobile-first para seções de conversão)
