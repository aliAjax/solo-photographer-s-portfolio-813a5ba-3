import { useMemo, useState, type ChangeEvent } from "react";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES: Record<keyof Fields, (v: string) => string> = {
  name: (v) => (v.trim().length === 0 ? "请填写姓名" : ""),
  email: (v) =>
    v.trim().length === 0
      ? "请填写邮箱"
      : !EMAIL_RE.test(v.trim())
        ? "请输入有效的邮箱地址"
        : "",
  message: (v) => (v.trim().length < 10 ? "留言至少需要 10 个字" : ""),
};

function validate(values: Fields): Errors {
  const errors: Errors = {};
  (Object.keys(RULES) as (keyof Fields)[]).forEach((k) => {
    const msg = RULES[k](values[k]);
    if (msg) errors[k] = msg;
  });
  return errors;
}

export default function Contact() {
  const [values, setValues] = useState<Fields>({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Record<keyof Fields, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const showError = (k: keyof Fields) => (touched[k] ? errors[k] : undefined);

  const onChange = (k: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [k]: e.target.value }));
  };

  const onBlur = (k: keyof Fields) => () => {
    setTouched((prev) => ({ ...prev, [k]: true }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setTouched({ name: true, email: true, message: true });
    setSubmitting(true);
    // 无后端：用延时模拟发送
    window.setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 700);
  };

  if (success) {
    return (
      <div className="container">
        <div className="contact-grid">
          <div className="contact-intro">
            <p className="eyebrow">Contact</p>
            <h1>联系</h1>
          </div>
          <div className="form-success" role="status">
            <h2>谢谢你的来信</h2>
            <p>消息已成功发送，我会尽快回复你。</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setValues({ name: "", email: "", message: "" });
                setTouched({ name: false, email: false, message: false });
                setSuccess(false);
              }}
            >
              再写一封
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="contact-grid">
        <div className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1>联系</h1>
          <p>
            如果你对肖像拍摄、高原影像或展览合作感兴趣，欢迎留言。
            我通常会在几天内回复。
          </p>
          <p className="contact-meta">合作范围：肖像约拍 · 影像授权 · 展览与出版</p>
        </div>

        <form noValidate onSubmit={onSubmit} aria-label="联系表单">
          <div className={`field ${showError("name") ? "field--invalid" : ""}`}>
            <label htmlFor="name">姓名</label>
            <input
              id="name"
              type="text"
              value={values.name}
              onChange={onChange("name")}
              onBlur={onBlur("name")}
              autoComplete="name"
            />
            {showError("name") && <p className="field__error">{errors.name}</p>}
          </div>

          <div className={`field ${showError("email") ? "field--invalid" : ""}`}>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={onChange("email")}
              onBlur={onBlur("email")}
              autoComplete="email"
            />
            {showError("email") && <p className="field__error">{errors.email}</p>}
          </div>

          <div className={`field ${showError("message") ? "field--invalid" : ""}`}>
            <label htmlFor="message">留言</label>
            <textarea
              id="message"
              value={values.message}
              onChange={onChange("message")}
              onBlur={onBlur("message")}
            />
            {showError("message") && <p className="field__error">{errors.message}</p>}
          </div>

          <button type="submit" className="btn" disabled={!isValid || submitting}>
            {submitting ? "发送中…" : "发送消息"}
          </button>
        </form>
      </div>
    </div>
  );
}
