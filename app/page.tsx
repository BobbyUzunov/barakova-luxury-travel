import Image from "next/image";

const services = [
  "Луксозни почивки",
  "Honeymoon пътувания",
  "Бутикови хотели",
  "Семейни премиум ваканции",
  "Екзотични дестинации",
  "Персонални маршрути",
];

const trustItems = [
  "Персонален подход",
  "Подбрани луксозни предложения",
  "Спестено време",
  "Внимание към всеки детайл",
];

const profileStats = [
  "Десетки посетени държави",
  "Стотици забележителности",
  "Персонален подход",
  "Подбрани преживявания",
];

const steps = [
  "Споделяш мечтаната дестинация",
  "Уточняваме стил, бюджет и предпочитания",
  "Получаваш подбрани предложения",
  "Избираш спокойно най-подходящата почивка",
];

const destinations = [
  {
    name: "Maldives",
    image:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Dubai",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bali",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Seychelles",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Greece",
    image:
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Thailand",
    image:
      "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "French Riviera",
    image:
      "https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=900&q=80",
  },
];

const navItems = [
  { label: "Начало", href: "#home" },
  { label: "Услуги", href: "#services" },
  { label: "Дестинации", href: "#destinations" },
  { label: "За мен", href: "#about" },
  { label: "Контакт", href: "#contact" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--ivory)] text-[var(--charcoal)]">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-10">
        <nav className="site-header mx-auto max-w-7xl">
          <a className="brand-lockup" href="#home">
            <span>Barakova Luxury Travel</span>
            <small>by Богдана Баракова</small>
          </a>

          <div className="header-nav" aria-label="Основна навигация">
            {navItems.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>

          <button className="btn-primary header-cta" type="button">
            Изпрати запитване
          </button>
        </nav>
      </header>

      <section
        id="home"
        className="hero-section relative min-h-[94svh] px-5 pb-14 pt-40 text-[var(--charcoal)] sm:min-h-[92svh] sm:px-8 sm:pt-36 lg:min-h-[96svh] lg:px-12"
      >
        <Image
          src="/hero-bogdana-beach.jpeg"
          alt="Богдана Баракова на плаж с поглед към морето"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="hero-image"
        />
        <div className="absolute inset-0 bg-[rgba(248,243,236,0.18)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,243,236,0.82),rgba(248,243,236,0.42)_44%,rgba(248,243,236,0.08)),linear-gradient(180deg,rgba(248,243,236,0.08),rgba(248,243,236,0.58))]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--ivory)] to-transparent" />

        <div className="hero-inner relative z-10 mx-auto flex min-h-[68svh] max-w-7xl items-center justify-center text-center sm:min-h-[66svh] lg:min-h-[72svh] lg:justify-start lg:text-left">
          <div className="hero-copy max-w-3xl animate-rise rounded-[1.6rem] bg-white/24 p-4 backdrop-blur-[2px] sm:rounded-[2rem] sm:p-5 lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
            <p className="hero-label mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--soft-brown)] sm:mb-5 sm:text-sm sm:tracking-[0.32em]">
              PRIVATE LUXURY TRAVEL CONSULTING
            </p>
            <h1 className="hero-title font-serif text-[2.45rem] leading-[1.03] text-balance sm:text-6xl lg:text-7xl">
              Луксозни пътувания, създадени специално за теб
            </h1>
            <p className="hero-subtitle mt-5 max-w-2xl text-base leading-7 text-[rgba(45,42,38,0.76)] sm:mt-6 sm:text-xl sm:leading-8">
              Персонални консултации за хора, които търсят стил, комфорт и
              внимателно подбрани преживявания по целия свят.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-center lg:justify-start">
              <button className="btn-primary" type="button">
                Заяви персонална консултация
              </button>
              <button className="btn-secondary" type="button">
                Разгледай дестинациите
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-12" id="services">
        <div className="section-heading">
          <p>Услуги</p>
          <h2>Как мога да ти помогна</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              className="lux-card animate-soft-in"
              style={{ animationDelay: `${index * 70}ms` }}
              key={service}
            >
              <span className="card-number">0{index + 1}</span>
              <h3>{service}</h3>
              <p>
                Дискретна селекция от премиум възможности, съобразени с
                желанията, ритъма и личния стил на всяко пътуване.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="section-heading text-left">
            <p>Процес</p>
            <h2>Как работи консултацията</h2>
            <span>
              Внимателен, спокоен и ясен процес, в който всеки детайл се
              подрежда около вашите предпочитания, бюджет и усещане за комфорт.
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {steps.map((step, index) => (
              <article className="step-card" key={step}>
                <div>{index + 1}</div>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell" id="destinations">
        <div className="section-heading">
          <p>Дестинации</p>
          <h2>Луксозни дестинации по света</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <article className="destination-card" key={destination.name}>
              <div
                className="destination-image"
                style={{ backgroundImage: `url(${destination.image})` }}
              />
              <div>
                <p>Curated stay</p>
                <h3>{destination.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <p>Доверие</p>
          <h2>Защо клиентите избират Barakova Luxury Travel</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <article className="trust-card" key={item}>
              <span>0{index + 1}</span>
              <h3>{item}</h3>
              <p>
                Спокойно планиране с усещане за лично отношение, прецизност и
                премиум стандарт във всяка препоръка.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell" id="about">
        <div className="about-panel profile-panel grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="profile-gallery">
            <div className="profile-photo profile-photo-main">
              <Image
                src="/images/barakova-1.jpg"
                alt="Портрет на Богдана Баракова"
                fill
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 82vw, 92vw"
                className="profile-image"
              />
            </div>
            <div className="profile-photo profile-photo-secondary">
              <Image
                src="/images/barakova-2.jpg"
                alt="Богдана Баракова, luxury travel consultant"
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 82vw, 0vw"
                className="profile-image"
              />
            </div>
          </div>
          <div className="profile-content">
            <p className="eyebrow">Профил</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Запознайте се с Богдана Баракова
            </h2>
            <div className="about-copy mt-5 space-y-4 text-base leading-7 text-[rgba(45,42,38,0.72)] sm:text-lg sm:leading-8">
              <p>
                Здравейте, аз съм Богдана Баракова – пътешественик по душа и
                човек, който вярва, че всяко пътуване може да се превърне в
                специално преживяване, когато е планирано с внимание към
                детайла.
              </p>
              <p>
                През годините съм посетила десетки държави и стотици
                забележителни места. Винаги търся онзи баланс между стил,
                комфорт, качество и автентично преживяване – не просто красива
                дестинация, а пътуване, което оставя спомен.
              </p>
              <p>
                Обичам да откривам бутикови хотели, скрити места, местни
                традиции и маршрути далеч от масовия туризъм. С Barakova Luxury
                Travel споделям своя личен опит и помагам на хората да планират
                по-добре, по-спокойно и по-разумно своите мечтани почивки.
              </p>
            </div>
            <div className="mission-card mt-7">
              <p>
                Моята мисия е да превърна мечтаната дестинация в добре
                планирано и незабравимо преживяване.
              </p>
            </div>
            <div className="profile-stats mt-7">
              {profileStats.map((stat) => (
                <div className="profile-stat" key={stat}>
                  <span />
                  <p>{stat}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="about-pill">Luxury consulting</span>
              <span className="about-pill">Boutique selection</span>
              <span className="about-pill">Tailored planning</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-8 lg:px-12" id="contact">
        <div className="final-cta mx-auto max-w-7xl px-6 py-16 text-center sm:px-10 lg:py-22">
          <p className="eyebrow justify-center">Контакт</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl">
            Готови ли сте за следващото си незабравимо пътуване?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/76">
            Нека създадем вашето следващо луксозно преживяване.
          </p>
          <button className="btn-primary mt-8" type="button">
            Изпрати запитване
          </button>
        </div>
      </section>
    </main>
  );
}
