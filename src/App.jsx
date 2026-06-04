import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  Mail,
  PartyPopper,
  ShieldCheck,
  Stamp,
  UserRound,
} from "lucide-react";
import {
  dateOptions,
  patternFallback,
  patterns,
  paymentOptions,
  plans,
  timeOptions,
} from "./demoData";

const stepLabels = ["プラン", "日時", "情報", "支払", "確認", "完了"];
const screenToStep = {
  top: 0, plans: 1, reserve: 2,
  account: 3, auth: 3, code: 3, password: 3, customer: 3, memo: 3,
  payment: 4, confirm: 5, complete: 6,
};

const getInitial = (key, fallback) => {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(key);
  if (patterns[value]) return value;
  if (patternFallback[value]) return patternFallback[value];
  return fallback;
};

const getInitialNavMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("nav") === "bottom" ? "bottom" : "classic";
};

const Icon = ({ as: Component, size = 20 }) => (
  <Component size={size} strokeWidth={2.4} />
);

function App() {
  const [patternKey, setPatternKey] = useState(() =>
    getInitial("pattern", "bento")
  );
  const [navMode, setNavMode] = useState(getInitialNavMode);
  const [screen, setScreen] = useState("top");
  const [planId, setPlanId] = useState(null);
  const [date, setDate] = useState(dateOptions[0]);
  const [time, setTime] = useState("");
  const [adult, setAdult] = useState(2);
  const [child, setChild] = useState(0);
  const [payment, setPayment] = useState("localPay");

  const pattern = patterns[patternKey];
  const copy = pattern.copy;
  const selectedPlan = useMemo(
    () => (planId ? plans.find((p) => p.id === planId) : null),
    [planId]
  );
  const activeStep = screenToStep[screen];

  const cssVars = {
    "--bg": pattern.background, "--primary": pattern.primary,
    "--secondary": pattern.secondary, "--gradient-from": pattern.gradientFrom,
    "--gradient-to": pattern.gradientTo, "--heading": pattern.heading,
    "--text": pattern.text, "--muted": pattern.muted,
    "--border": pattern.border, "--surface": pattern.surface,
    "--tint": pattern.tint, "--chip": pattern.chip,
    "--chip-text": pattern.chipText, "--shadow": pattern.shadow,
    "--bg-image": `url(${pattern.bgImage})`,
  };

  const updateUrlState = (nextPattern, nextNavMode) => {
    const params = new URLSearchParams();
    params.set("pattern", nextPattern);
    if (nextNavMode === "bottom") params.set("nav", "bottom");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const updatePattern = (next) => {
    setPatternKey(next);
    updateUrlState(next, navMode);
  };

  const updateNavMode = (next) => {
    setNavMode(next);
    updateUrlState(patternKey, next);
  };

  const resetDemo = () => {
    setScreen("top");
    setPlanId(null);
    setTime("");
    setAdult(2);
    setChild(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const go = (next) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pk = patternKey;
  const bookingAction = getBookingActionState({
    screen,
    selectedPlan,
    date,
    time,
    adult,
    child,
    payment,
    go,
  });

  return (
    <main className={`app pattern-${pk} nav-${navMode}`} style={cssVars}>
      <DemoHeader
        patternKey={pk}
        navMode={navMode}
        onPattern={updatePattern}
        onNavMode={updateNavMode}
        onReset={resetDemo}
      />

      {screen === "top" ? (
        <TopScreen
          hero={pattern.hero}
          pk={pk}
          onStart={() => go("plans")}
          onPlanStart={(id) => {
            setPlanId(id);
            go("reserve");
          }}
        />
      ) : (
        <>
          <Stepper active={activeStep} />
          <div className={`booking-workspace ${bookingAction ? "has-action" : ""}`}>
            <div className="shell">
              {screen === "plans" && (
                <PlansScreen
                  selected={planId} onSelect={setPlanId}
                  onNext={() => go("reserve")} onBack={() => go("top")}
                  pk={pk} copy={copy} selectedPlan={selectedPlan}
                />
              )}
              {screen === "reserve" && (
                <ReserveScreen
                  date={date} time={time} adult={adult} child={child}
                  onDate={setDate} onTime={setTime} onAdult={setAdult} onChild={setChild}
                  onNext={() => go("account")} onBack={() => go("plans")}
                  pk={pk} copy={copy}
                />
              )}
              {screen === "account" && (
                <AccountScreen
                  onGuest={() => go("customer")} onMember={() => go("auth")}
                  onBack={() => go("reserve")} pk={pk} copy={copy}
                />
              )}
              {screen === "auth" && <AuthScreen onNext={() => go("code")} onBack={() => go("account")} pk={pk} />}
              {screen === "code" && <CodeScreen onNext={() => go("password")} onBack={() => go("auth")} pk={pk} />}
              {screen === "password" && <PasswordScreen onNext={() => go("customer")} onBack={() => go("code")} pk={pk} />}
              {screen === "customer" && <CustomerScreen onNext={() => go("memo")} onBack={() => go("account")} pk={pk} />}
              {screen === "memo" && <MemoScreen onNext={() => go("payment")} onBack={() => go("customer")} pk={pk} copy={copy} />}
              {screen === "payment" && (
                <PaymentScreen
                  payment={payment} onPayment={setPayment}
                  onNext={() => go("confirm")} onBack={() => go("memo")}
                  pk={pk} copy={copy}
                />
              )}
              {screen === "confirm" && (
                <ConfirmScreen
                  plan={selectedPlan} date={date} time={time}
                  adult={adult} child={child} payment={payment}
                  onNext={() => go("complete")} onBack={() => go("payment")}
                  pk={pk} copy={copy}
                />
              )}
              {screen === "complete" && (
                <CompleteScreen
                  plan={selectedPlan} date={date} time={time}
                  adult={adult} child={child} onReset={resetDemo}
                  pk={pk} copy={copy}
                />
              )}
              {navMode === "bottom" && bookingAction && (
                <BookingInlineAction action={bookingAction} />
              )}
            </div>
            {navMode === "bottom" && bookingAction && (
              <BookingActionTray action={bookingAction} />
            )}
          </div>
        </>
      )}
    </main>
  );
}

function getBookingActionState({ screen, selectedPlan, date, time, adult, child, payment, go }) {
  const people = `大人${adult}名${child ? ` / 小人${child}名` : ""}`;
  const paymentTitle = paymentOptions.find(([key]) => key === payment)?.[1] ?? "支払い方法";
  const summaryItems = getBookingSummaryItems({
    screen,
    selectedPlan,
    date,
    time,
    people,
    paymentTitle,
  });

  if (screen === "plans") {
    return {
      summaryLabel: selectedPlan ? "選択中" : "未選択",
      summaryValue: selectedPlan?.title ?? "プランを選択してください",
      summaryItems,
      ctaLabel: selectedPlan ? "このプランで日時へ" : "日時へ進む",
      disabled: !selectedPlan,
      disabledHint: "プランを選ぶと進めます",
      onPrimary: () => go("reserve"),
    };
  }

  if (screen === "reserve") {
    return {
      summaryLabel: time ? "日時と人数" : "未選択",
      summaryValue: time ? `${date} ${time} / ${people}` : "来園時間を選んでください",
      summaryItems,
      ctaLabel: "予約者情報へ",
      disabled: !time,
      disabledHint: "来園時間を選ぶと進めます",
      onPrimary: () => go("account"),
    };
  }

  if (screen === "auth") {
    return {
      summaryLabel: "メール確認",
      summaryValue: "メールアドレスを確認します",
      summaryItems,
      ctaLabel: "認証コードを受け取る",
      onPrimary: () => go("code"),
    };
  }

  if (screen === "code") {
    return {
      summaryLabel: "認証コード",
      summaryValue: "届いた番号を入力中",
      summaryItems,
      ctaLabel: "次へ",
      onPrimary: () => go("password"),
    };
  }

  if (screen === "password") {
    return {
      summaryLabel: "パスワード設定",
      summaryValue: "次回の予約をスムーズにします",
      summaryItems,
      ctaLabel: "お客様情報へ",
      onPrimary: () => go("customer"),
    };
  }

  if (screen === "customer") {
    return {
      summaryLabel: "お客様情報",
      summaryValue: "当日のご案内先を入力中",
      summaryItems,
      ctaLabel: "来園メモへ",
      onPrimary: () => go("memo"),
    };
  }

  if (screen === "memo") {
    return {
      summaryLabel: "連絡事項",
      summaryValue: "任意入力",
      summaryItems,
      ctaLabel: "お支払いへ",
      onPrimary: () => go("payment"),
    };
  }

  if (screen === "payment") {
    return {
      summaryLabel: "支払い",
      summaryValue: paymentTitle,
      summaryItems,
      ctaLabel: "予約内容を確認する",
      onPrimary: () => go("confirm"),
    };
  }

  if (screen === "confirm") {
    return {
      summaryLabel: "最終確認",
      summaryValue: selectedPlan?.title ?? "予約内容",
      summaryItems,
      ctaLabel: "この内容で予約する",
      onPrimary: () => go("complete"),
    };
  }

  return null;
}

function getBookingSummaryItems({ screen, selectedPlan, date, time, people, paymentTitle }) {
  const step = screenToStep[screen] ?? 0;
  const items = [];

  items.push({
    label: "プラン",
    value: selectedPlan?.title ?? "未選択",
    status: selectedPlan ? "done" : "current",
  });

  if (selectedPlan && step >= 2) {
    items.push({
      label: "日時",
      value: time ? `${date} ${time}` : "来園時間を選択中",
      status: time ? "done" : "current",
    });
    items.push({
      label: "人数",
      value: people,
      status: "done",
    });
  }

  if (time && step >= 3 && screen !== "account") {
    items.push({
      label: "予約者",
      value: step >= 4 ? "入力済み" : "入力中",
      status: step >= 4 ? "done" : "current",
    });
  }

  if (time && step >= 3 && ["memo", "payment", "confirm"].includes(screen)) {
    items.push({
      label: "連絡事項",
      value: screen === "memo" ? "任意入力" : "入力済み",
      status: screen === "memo" ? "current" : "done",
    });
  }

  if (step >= 4) {
    items.push({
      label: "支払い",
      value: paymentTitle,
      status: step >= 5 ? "done" : "current",
    });
  }

  if (step >= 5) {
    items.push({
      label: "確認",
      value: "最終確認",
      status: "current",
    });
  }

  return items;
}

/* ================================================
   Demo Header
   ================================================ */
function DemoHeader({ patternKey, navMode, onPattern, onNavMode, onReset }) {
  return (
    <header className="demo-header">
      <div className="demo-tabs">
        {Object.values(patterns).map((p) => (
          <button
            className={`demo-tab ${p.key === patternKey ? "is-active" : ""}`}
            key={p.key}
            onClick={() => onPattern(p.key)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="nav-mode-toggle" aria-label="ナビゲーション表示">
        <button
          className={navMode === "classic" ? "is-active" : ""}
          type="button"
          onClick={() => onNavMode("classic")}
        >
          上部
        </button>
        <button
          className={navMode === "bottom" ? "is-active" : ""}
          type="button"
          onClick={() => onNavMode("bottom")}
        >
          下部
        </button>
      </div>
      <button className="icon-button" aria-label="TOPへ戻る" onClick={onReset}>
        <Home size={18} />
      </button>
    </header>
  );
}

function BookingActionTray({ action }) {
  return (
    <aside className="booking-action-tray" aria-label="予約サマリー">
      <div className="booking-summary-heading">
        <small>予約サマリー</small>
        <strong>決まった内容</strong>
      </div>
      <ol className="booking-summary-list">
        {action.summaryItems.map((item) => (
          <li className={`booking-summary-item is-${item.status}`} key={item.label}>
            <span className="booking-summary-mark">
              {item.status === "done" ? <Check size={14} /> : null}
            </span>
            <span className="booking-summary-copy">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function BookingInlineAction({ action }) {
  return (
    <div className="booking-inline-action">
      <div className="booking-inline-summary">
        <small>{action.summaryLabel}</small>
        <strong>{action.summaryValue}</strong>
        {action.disabled && action.disabledHint && (
          <span>{action.disabledHint}</span>
        )}
      </div>
      <button
        className="primary-action booking-inline-cta"
        disabled={action.disabled}
        onClick={action.disabled ? undefined : action.onPrimary}
        type="button"
      >
        {action.ctaLabel}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

/* ================================================
   Stepper — unified left-aligned number + label
   ================================================ */
function Stepper({ active }) {
  return (
    <nav className="unified-stepper" aria-label="予約ステップ">
      {stepLabels.map((label, i) => {
        const step = i + 1;
        const isDone = step < active;
        const isCurrent = step === active;
        return (
          <div
            className={`step-item ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
            key={i}
          >
            <span className="step-num">
              {isDone ? <Check size={12} /> : step}
            </span>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

/* ================================================
   Section Header — 3 different structures
   ================================================ */
function SectionHeader({ eyebrow, title, icon, pk }) {
  if (pk === "craft") {
    return (
      <div className="craft-section">
        <span className="craft-section-mark">
          <Icon as={icon} size={18} />
        </span>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
    );
  }

  if (pk === "studio") {
    return (
      <div className="studio-section">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <Icon as={icon} size={22} />
      </div>
    );
  }

  if (pk === "puerto") {
    return (
      <div className="puerto-section">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <span className="puerto-section-icon">
          <Icon as={icon} size={20} />
        </span>
      </div>
    );
  }

  if (pk === "glassmorphism") {
    return (
      <div className="glass-section">
        <div className="glass-section-badge">
          <Icon as={icon} size={16} />
          {eyebrow}
        </div>
        <h2>{title}</h2>
      </div>
    );
  }

  // bento
  return (
    <div className="bento-banner">
      <div className="bento-banner-badge">
        <Icon as={icon} size={14} />
        {eyebrow}
      </div>
      <h2>{title}</h2>
    </div>
  );
}

/* ================================================
   TOP Screen — concept-specific benefits
   ================================================ */
function TopScreen({ hero, pk, onStart, onPlanStart }) {
  return (
    <>
      <section className="qr-entry">
        <img className="qr-entry-hero-image" src={hero.image} alt="" />
        <div className="qr-entry-copy">
          <h1>サンプル体験パーク様専用ご予約サイト</h1>
          <div className="qr-entry-actions">
            <button className="primary-action" onClick={onStart}>
              ご予約画面へ
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="qr-entry-facts" aria-label="予約状況">
            <span><strong>{plans.length}</strong>件公開中</span>
          </div>
        </div>

        <div className="qr-plan-panel" aria-label="現在公開中のプラン">
          <div className="qr-plan-panel-head">
            <small>公開中のプラン</small>
            <strong>空き時間を選んで予約へ</strong>
          </div>
          <div className="qr-plan-list">
            {plans.map((plan) => (
              <button className="qr-plan-card" key={plan.id} type="button" onClick={() => onPlanStart(plan.id)}>
                <img src={plan.image} alt="" />
                <span>
                  <strong>{plan.title}</strong>
                  <small>{plan.pr}</small>
                  <em>{timeOptions.slice(0, 3).join(" / ")}</em>
                </span>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </div>
      </section>
      <BookingNotice pk={pk} />
    </>
  );
}

function BookingNotice({ pk }) {
  return (
    <section className={`booking-notice booking-notice-${pk}`} aria-labelledby="booking-notice-title">
      <h2 id="booking-notice-title">ご予約について</h2>
      <ul>
        <li>定員は果物の状況により増減します。</li>
        <li>一度、予約を締め切った日でも予約を再開する場合があります。</li>
      </ul>
    </section>
  );
}

/* ================================================
   Benefits — 3 completely different structures
   ================================================ */
function BenefitsSection({ benefits, pk }) {
  if (pk === "craft") {
    return (
      <section className="craft-benefits">
        {benefits.map(([title, text, icon]) => (
          <div className="craft-benefit-sticker" key={title}>
            <Icon as={icon} size={18} />
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (pk === "studio") {
    return (
      <section className="studio-benefits">
        {benefits.map(([title, text, icon], i) => (
          <div className="studio-benefit-row" key={title}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <Icon as={icon} size={18} />
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (pk === "puerto") {
    return (
      <section className="puerto-benefits">
        {benefits.map(([title, text, icon]) => (
          <div className="puerto-benefit-card" key={title}>
            <Icon as={icon} size={18} />
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </section>
    );
  }

  // bento — unequal bento grid
  return (
    <section className="bento-benefits">
      {benefits.map(([title, text, icon], i) => (
        <div className={`bento-benefit-block bento-benefit-${i}`} key={title}>
          <Icon as={icon} size={20} />
          <strong>{title}</strong>
          <p>{text}</p>
        </div>
      ))}
    </section>
  );
}

/* ================================================
   Plans Screen — 3 different layouts
   ================================================ */
function PlanCardContent({ plan, selected, onSelect }) {
  const isSelected = selected === plan.id;
  return (
    <>
      <strong>{plan.title}</strong>
      <p className="plan-pr">{plan.pr}</p>
      <div className="plan-times">
        {timeOptions.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="plan-actions">
        <button className="plan-detail-btn" type="button" onClick={(e) => e.stopPropagation()}>詳細</button>
        <button
          className={`plan-select-btn ${isSelected ? "is-selected" : ""}`}
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(plan.id); }}
        >
          {isSelected ? "選択中" : "選択"}
        </button>
      </div>
      {isSelected && (
        <div className="plan-selected-expand">
          <CheckCircle2 size={18} />
          <span>選択済み</span>
          <strong>予約プラン</strong>
        </div>
      )}
    </>
  );
}

function PlansScreen({ selected, onSelect, onNext, onBack, pk, copy, selectedPlan }) {
  const planCards = () => {
    if (pk === "craft") {
      return (
        <div className="craft-plan-board">
          {plans.map((plan) => (
            <div className={`craft-plan-card ${selected === plan.id ? "is-selected" : ""}`} key={plan.id}>
              <div className="craft-plan-photo">
                <img src={plan.image} alt="" />
              </div>
              <div className="craft-plan-text">
                <PlanCardContent plan={plan} selected={selected} onSelect={onSelect} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (pk === "glassmorphism") {
      return <GlassCarousel selected={selected} onSelect={onSelect} />;
    }
    if (pk === "studio") {
      return (
        <div className="studio-carousel-shell">
          <div className="studio-swipe-hint" aria-hidden="true">
            <ChevronLeft size={14} />
            <span>左右にスワイプ</span>
            <ChevronRight size={14} />
          </div>
          <div className="studio-plan-list">
            {plans.map((plan, i) => (
              <div className={`studio-plan-row ${selected === plan.id ? "is-selected" : ""}`} key={plan.id}>
                <span className="studio-plan-index">{String(i + 1).padStart(2, "0")}</span>
                <img src={plan.image} alt="" />
                <div className="studio-plan-copy">
                  <PlanCardContent plan={plan} selected={selected} onSelect={onSelect} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (pk === "puerto") {
      return (
        <div className="puerto-plan-grid">
          {plans.map((plan, i) => (
            <div className={`puerto-plan-card ${selected === plan.id ? "is-selected" : ""}`} key={plan.id}>
              <div className={`puerto-plan-image puerto-plan-image-${i + 1}`}>
                <img src={plan.image} alt="" />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="puerto-plan-body">
                <PlanCardContent plan={plan} selected={selected} onSelect={onSelect} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    // bento
    return (
      <div className="bento-ticket-grid">
        {plans.map((plan) => (
          <div className={`bento-ticket ${selected === plan.id ? "is-selected" : ""}`} key={plan.id}>
            <img src={plan.image} alt="" />
            <div className="bento-ticket-body">
              <PlanCardContent plan={plan} selected={selected} onSelect={onSelect} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <SectionHeader eyebrow={copy.planEyebrow} title={copy.planTitle} icon={PartyPopper} pk={pk} />
      {planCards()}
      <button className="back-action" onClick={onBack}>
        <ArrowLeft size={18} /> TOPへもどる
      </button>
      {selected && (
        <div className={`plan-fixed-cta plan-fixed-cta-${pk}`}>
          <div className="plan-fixed-info">
            <small>選択中</small>
            <strong>{selectedPlan?.title}</strong>
          </div>
          <button className="primary-action" onClick={onNext}>
            {copy.planCta} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </>
  );
}

/* ================================================
   Glass Carousel — with slide hint arrows + dots
   ================================================ */
function GlassCarousel({ selected, onSelect }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="glass-carousel-wrap">
      {canLeft && (
        <button className="carousel-arrow carousel-arrow-left" onClick={() => scroll(-1)} aria-label="前へ">
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="glass-plan-carousel" ref={scrollRef}>
        {plans.map((plan) => (
          <div className={`glass-plan-card ${selected === plan.id ? "is-selected" : ""}`} key={plan.id}>
            <img src={plan.image} alt="" />
            <div className="glass-plan-info">
              <PlanCardContent plan={plan} selected={selected} onSelect={onSelect} />
            </div>
          </div>
        ))}
      </div>
      {canRight && (
        <button className="carousel-arrow carousel-arrow-right" onClick={() => scroll(1)} aria-label="次へ">
          <ChevronRight size={22} />
        </button>
      )}
      <div className="carousel-dots">
        {plans.map((plan) => (
          <span className={`carousel-dot ${selected === plan.id ? "active" : ""}`} key={plan.id} />
        ))}
      </div>
    </div>
  );
}

/* ================================================
   Reserve Screen
   ================================================ */
function ReserveScreen({ date, time, adult, child, onDate, onTime, onAdult, onChild, onNext, onBack, pk, copy }) {
  const content = (
    <>
      <ChoicePanel title="ご予約日" options={dateOptions} value={date} onChange={onDate} pk={pk} />
      <ChoicePanel title="来園時間" options={timeOptions} value={time} onChange={onTime} pk={pk} />
      <section className="panel">
        <h2>人数</h2>
        <Counter label="大人" value={adult} onChange={onAdult} min={1} />
        <Counter label="小人" value={child} onChange={onChild} min={0} />
      </section>
    </>
  );

  if (pk === "glassmorphism") {
    return (
      <>
        <SectionHeader eyebrow={copy.dateEyebrow} title={copy.dateTitle} icon={CalendarDays} pk={pk} />
        {content}
        <div className="glass-cta-sheet">
          <button className="primary-action" disabled={!time} onClick={onNext}>
            {copy.dateCta} <ArrowRight size={18} />
          </button>
          <button className="back-action" onClick={onBack}>
            <ArrowLeft size={18} /> もどる
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader eyebrow={copy.dateEyebrow} title={copy.dateTitle} icon={CalendarDays} pk={pk} />
      {content}
      {pk === "bento" || pk === "craft" || pk === "studio" || pk === "puerto" ? (
        <>
          <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>
          <div className="bento-bottom-bar">
            <div className="bento-bar-info"><small>次のステップ</small><strong>予約者情報</strong></div>
            <button className="primary-action" disabled={!time} onClick={onNext}>
              {copy.dateCta} <ArrowRight size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="neu-big-cta">
          <button className="primary-action" disabled={!time} onClick={onNext}>
            {copy.dateCta} <ArrowRight size={18} />
          </button>
          <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>
        </div>
      )}
    </>
  );
}

function ChoicePanel({ title, options, value, onChange, pk }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="choice-grid">
        {options.map((option) => (
          <button className={value === option ? "is-active" : ""} key={option} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

function Counter({ label, value, onChange, min }) {
  return (
    <div className="counter-row">
      <strong>{label}</strong>
      <div>
        <button onClick={() => onChange(Math.max(min, value - 1))}>-</button>
        <span>{value}</span>
        <button onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

/* ================================================
   Account Screen
   ================================================ */
function AccountScreen({ onGuest, onMember, onBack, pk, copy }) {
  return (
    <>
      <SectionHeader eyebrow={copy.accountEyebrow} title={copy.accountTitle} icon={UserRound} pk={pk} />
      <section className="panel">
        <button className="wide-choice" onClick={onGuest}>
          会員登録せず予約へ進む <ChevronRight />
        </button>
        <button className="wide-choice secondary" onClick={onMember}>
          メールで会員登録して進む <Mail />
        </button>
      </section>
      <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>
    </>
  );
}

/* ================================================
   Form Screens
   ================================================ */
function AuthScreen({ onNext, onBack, pk }) {
  return <SimpleForm eyebrow="メールで確認" title="メールアドレス" button="認証コードを受け取る" onNext={onNext} onBack={onBack} pk={pk} fields={["メールアドレス"]} />;
}
function CodeScreen({ onNext, onBack, pk }) {
  return <SimpleForm eyebrow="届いた番号を入力" title="認証コード" button="次へ" onNext={onNext} onBack={onBack} pk={pk} fields={["6桁の認証コード", "メールアドレス"]} />;
}
function PasswordScreen({ onNext, onBack, pk }) {
  return <SimpleForm eyebrow="次回をスムーズに" title="パスワード設定" button="お客様情報へ" onNext={onNext} onBack={onBack} pk={pk} fields={["パスワード", "確認用パスワード"]} />;
}
function CustomerScreen({ onNext, onBack, pk }) {
  return <SimpleForm eyebrow="当日のご案内用" title="お客様情報" button="来園メモへ" onNext={onNext} onBack={onBack} pk={pk} fields={["姓", "名", "セイ", "メイ", "電話番号", "メールアドレス"]} />;
}

function MemoScreen({ onNext, onBack, pk, copy }) {
  return (
    <>
      <SectionHeader eyebrow={copy.memoEyebrow} title={copy.memoTitle} icon={ShieldCheck} pk={pk} />
      <section className="panel">
        <label className="field full">
          <span>連絡事項</span>
          <textarea defaultValue="ベビーカーで参加予定です。入口に近い案内だと助かります。" />
        </label>
      </section>
      <CtaBlock pk={pk} onNext={onNext} onBack={onBack} nextLabel="お支払いへ" />
    </>
  );
}

/* ================================================
   Payment Screen
   ================================================ */
function PaymentScreen({ payment, onPayment, onNext, onBack, pk, copy }) {
  return (
    <>
      <SectionHeader eyebrow={copy.paymentEyebrow} title={copy.paymentTitle} icon={ShieldCheck} pk={pk} />
      <section className="panel">
        <div className="payment-list">
          {paymentOptions.map(([key, title, text, icon]) => (
            <button
              className={payment === key ? "is-selected" : ""}
              key={key} onClick={() => onPayment(key)}
            >
              <Icon as={icon} />
              <span><strong>{title}</strong><small>{text}</small></span>
              {payment === key && <CheckCircle2 />}
            </button>
          ))}
        </div>
      </section>
      <CtaBlock pk={pk} onNext={onNext} onBack={onBack} nextLabel={copy.paymentCta} />
    </>
  );
}

/* ================================================
   Confirm Screen
   ================================================ */
function ConfirmScreen({ plan, date, time, adult, child, payment, onNext, onBack, pk, copy }) {
  const rows = [
    ["施設", "サンプル体験パーク"],
    ["体験", plan.title],
    ["日時", `${date} ${time}`],
    ["人数", `大人${adult}名${child ? ` / 小人${child}名` : ""}`],
    ["支払い", payment === "credit" ? "事前決済（サンプル）" : "当日受付払い"],
  ];

  if (pk === "glassmorphism") {
    return (
      <>
        <SectionHeader eyebrow={copy.confirmEyebrow} title={copy.confirmTitle} icon={CheckCircle2} pk={pk} />
        <div className="glass-confirm-pass">
          {rows.map(([label, value]) => (
            <div key={label} className="glass-confirm-row">
              <span>{label}</span><strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="glass-cta-sheet">
          <button className="primary-action" onClick={onNext}>{copy.confirmCta} <ArrowRight size={18} /></button>
          <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>
        </div>
      </>
    );
  }

  if (pk === "bento" || pk === "craft" || pk === "studio" || pk === "puerto") {
    return (
      <>
        <SectionHeader eyebrow={copy.confirmEyebrow} title={copy.confirmTitle} icon={CheckCircle2} pk={pk} />
        <div className="bento-receipt-card">
          <div className="bento-receipt-items">
            {rows.map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
        </div>
        <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>
        <div className="bento-bottom-bar">
          <div className="bento-bar-info"><small>確認済み</small><strong>{plan.title}</strong></div>
          <button className="primary-action" onClick={onNext}>{copy.confirmCta} <ArrowRight size={18} /></button>
        </div>
      </>
    );
  }

  // neumorphism
  return (
    <>
      <SectionHeader eyebrow={copy.confirmEyebrow} title={copy.confirmTitle} icon={CheckCircle2} pk={pk} />
      <section className="panel">
        <div className="confirm-table">
          {rows.map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </section>
      <div className="neu-big-cta">
        <button className="primary-action" onClick={onNext}>{copy.confirmCta} <ArrowRight size={18} /></button>
        <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>
      </div>
    </>
  );
}

/* ================================================
   Complete Screen — 3 different celebrations
   ================================================ */
function CompleteScreen({ plan, date, time, adult, child, onReset, pk, copy }) {
  const info = [
    ["施設", "サンプル体験パーク"],
    ["体験", plan.title],
    ["日時", `${date} ${time}`],
    ["人数", `大人${adult}名${child ? ` / 小人${child}名` : ""}`],
  ];

  if (pk === "neumorphism") {
    return (
      <>
        <div className="neu-complete">
          <div className="neu-complete-circle">
            <CheckCircle2 size={56} />
          </div>
          <h1>{copy.completeLine1}</h1>
          <p className="neu-complete-sub">{copy.completeLine2}</p>
          <div className="neu-complete-ref">
            <small>予約番号</small>
            <strong>SAMPLE-0528</strong>
          </div>
        </div>
        <section className="panel">
          <div className="confirm-table">
            {info.map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}
          </div>
        </section>
        <div className="neu-big-cta">
          <button className="primary-action" onClick={onReset}>TOPへ戻る <Home size={18} /></button>
        </div>
      </>
    );
  }

  if (pk === "glassmorphism") {
    return (
      <>
        <div className="glass-boarding-pass">
          <div className="glass-pass-header">
            <PartyPopper size={20} />
            <span>予約確定</span>
          </div>
          <h1>{copy.completeLine1}</h1>
          <p>{copy.completeLine2}</p>
          <div className="glass-pass-divider" />
          <div className="glass-pass-details">
            {info.map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}
          </div>
          <div className="glass-pass-barcode">
            <span>SAMPLE-0528</span>
          </div>
        </div>
        <div className="glass-cta-sheet">
          <button className="primary-action" onClick={onReset}>TOPへ戻る <Home size={18} /></button>
        </div>
      </>
    );
  }

  // bento / craft / studio / puerto
  return (
    <>
      <div className="bento-receipt-card bento-receipt-complete">
        <div className="bento-receipt-header">予約完了</div>
        <h1>{copy.completeLine1}</h1>
        <p>{copy.completeLine2}</p>
        <div className="bento-receipt-items">
          {info.map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}
        </div>
        <div className="bento-receipt-stamp">
          <Stamp size={28} />
          <span>CONFIRMED</span>
        </div>
        <div className="bento-receipt-ref">予約番号: SAMPLE-0528</div>
        <button className="primary-action receipt-reset-action" onClick={onReset}>
          TOPへ戻る <Home size={18} />
        </button>
      </div>
      <div className="bento-bottom-bar">
        <div className="bento-bar-info"><small>予約完了</small><strong>サンプル体験パーク</strong></div>
        <button className="primary-action" onClick={onReset}>TOPへ戻る <Home size={18} /></button>
      </div>
    </>
  );
}

/* ================================================
   Shared Helpers
   ================================================ */
function SimpleForm({ eyebrow, title, button, fields, onNext, onBack, pk }) {
  return (
    <>
      <SectionHeader eyebrow={eyebrow} title={title} icon={Mail} pk={pk} />
      <section className="panel">
        <div className="field-grid">
          {fields.map((field) => (
            <label className="field" key={field}>
              <span>{field}</span>
              <input defaultValue={sampleValue(field)} type={field.includes("パスワード") ? "password" : "text"} />
            </label>
          ))}
        </div>
      </section>
      <CtaBlock pk={pk} onNext={onNext} onBack={onBack} nextLabel={button} />
    </>
  );
}

function CtaBlock({ pk, onNext, onBack, nextLabel = "次へ", disabled = false }) {
  if (pk === "glassmorphism") {
    return (
      <div className="glass-cta-sheet">
        {onNext && <button className="primary-action" disabled={disabled} onClick={onNext}>{nextLabel} <ArrowRight size={18} /></button>}
        {onBack && <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>}
      </div>
    );
  }
  if (pk === "bento" || pk === "craft" || pk === "studio" || pk === "puerto") {
    return (
      <>
        {onBack && <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>}
        {onNext && (
          <div className="bento-bottom-bar">
            <div />
            <button className="primary-action" disabled={disabled} onClick={onNext}>{nextLabel} <ArrowRight size={18} /></button>
          </div>
        )}
      </>
    );
  }
  // neumorphism
  return (
    <div className="neu-big-cta">
      {onNext && <button className="primary-action" disabled={disabled} onClick={onNext}>{nextLabel} <ArrowRight size={18} /></button>}
      {onBack && <button className="back-action" onClick={onBack}><ArrowLeft size={18} /> もどる</button>}
    </div>
  );
}

function sampleValue(label) {
  if (label.includes("メール")) return "sample@example.com";
  if (label.includes("電話")) return "08000000000";
  if (label.includes("コード")) return "654321";
  if (label.includes("パスワード")) return "sample2026";
  if (label === "姓") return "佐藤";
  if (label === "名") return "未来";
  if (label === "セイ") return "サトウ";
  if (label === "メイ") return "ミライ";
  return "";
}

export default App;
