import { getPhoto, photoUrl } from "../data/portfolio";

// 时间线只陈述与三个系列相关的长期实践节点，不虚构奖项或机构经历。
const TIMELINE = [
  { title: "开始人像拍摄实践", desc: "以黑白特写记录镜头前的坦露与防备，后集结为系列《凝视》。" },
  { title: "首次进入高海拔无人区", desc: "持续追踪山脊、草甸与雾气在四季光线下的变化，形成《无人之境》。" },
  { title: "记录高原牧场日常", desc: "长期走访游牧牧场，观察牛群与人在高原上的共生，完成《高原牧歌》。" },
  { title: "三个系列的长期延续", desc: "肖像与高原两条线索仍在并行拍摄，作品集随新的照片持续更新。" },
];

export default function About() {
  // 关于页主图同样取自 mock-data 的真实照片（《无人之境》中的地貌），不使用参考图。
  const portrait = getPhoto("landscape-03");

  return (
    <div className="container">
      <div className="about-grid">
        <div className="about-portrait">
          <div
            className="ratio-box"
            style={{ aspectRatio: `${portrait.width} / ${portrait.height}` }}
          >
            <img
              src={photoUrl(portrait.file)}
              alt={portrait.altText}
              onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
            />
          </div>
        </div>

        <div className="about-copy">
          <p className="eyebrow">About</p>
          <h1>关于</h1>
          <p>
            我是一名独立摄影师，长期拍摄两类题材：黑白人像特写，
            以及高原地区的自然风光与牧场生活记录。
          </p>
          <p>
            人像系列《凝视》聚焦眼神与皮肤纹理，探讨镜头前的坦露与防备；
            《无人之境》记录高海拔无人区纯粹地貌在四季光线下的变化；
            《高原牧歌》则关注牧场、牛群与人在高原上的共生关系与日常节奏。
          </p>
          <p>
            我偏好克制的影调与充足的留白，让光线、纹理和停顿自己说话。
          </p>

          <ul className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
