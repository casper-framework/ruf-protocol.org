import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "What is RUF?",
    Svg: require("@site/static/img/undraw_building-blocks_h5jb.svg").default,
    description: (
      <>
        It is a frontend architecture and protocol focused on making application
        state predictable, reliable, scalable and controlled by backend.
      </>
    ),
  },
  {
    title: "Why do I need RUF?",
    Svg: require("@site/static/img/undraw_mobile-wireframe_fpih.svg").default,
    description: (
      <>
        Frontend applications are inherently complex due to all the different
        types of state it must manage simultaneously. RUF solves it by bringing
        predictability into chaos.
      </>
    ),
  },
  {
    title: "How can I use RUF?",
    Svg: require("@site/static/img/undraw_software-engineer_xv60.svg").default,
    description: (
      <>
        As any architecture, RUF can be implemented by anyone that enjoys and
        see value on it. You can take a look at{" "}
        <Link to="/spec/alternatives">alternatives</Link>.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
