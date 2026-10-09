import Image from "next/image";
import { resultImages } from "@/data/dashboard";

const loopImages = [...resultImages, ...resultImages, ...resultImages];

function ResultStrip({ keyPrefix }: { keyPrefix: string }) {
  return (
    <div className="results-marquee__group" aria-hidden={keyPrefix !== "a"}>
      {loopImages.map((image, index) => (
        <div className="results-marquee__item" key={`${keyPrefix}-${image.src}-${index}`}>
          <Image
            alt={keyPrefix === "a" ? image.alt : ""}
            height={300}
            src={image.src}
            width={460}
          />
        </div>
      ))}
    </div>
  );
}

export function ResultsMarquee() {
  return (
    <section className="results-marquee" aria-label="Our Result">
      <div className="site-container">
        <div className="results-marquee__heading">
          <span className="results-marquee__rule results-marquee__rule--left" aria-hidden />
          <h2 className="results-marquee__title">Our Result</h2>
          <span className="results-marquee__rule results-marquee__rule--right" aria-hidden />
        </div>
      </div>

      <div className="results-marquee__viewport">
        <div className="results-marquee__track">
          <ResultStrip keyPrefix="a" />
          <ResultStrip keyPrefix="b" />
        </div>
      </div>
    </section>
  );
}
