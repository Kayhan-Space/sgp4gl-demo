import Head from "next/head";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import CesiumWrapper from "../Components/CesiumWrapper";
import { tle_cleaner } from "@/utils/tles";
import { useEffect, useState } from "react";
import { TLE } from "@/types/tle";

type Props = {
  ssrTles: TLE[] | null;
};

export const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ ssrTles }) => {
  const websiteTitle = "sgp4.gl | GPU accelerated SGP4";
  const websiteDescription =
    "3d satellite visualization using sgp4.gl, CesiumJs, and Next.js";

  const [tles, setTles] = useState<TLE[]>([]);

  useEffect(() => {
    const fetchTLEs = async () => {
      const res = await fetch("/tle_04_13_2024.txt");
      const tleData = await res.text();

      if (typeof tleData === "string" && tleData.length) {
        const tleLines = tleData.split(/\r?\n/);
        const tleTriplets: TLE[] = [];
        for (let i = 0; i < tleLines.length; i += 3) {
          if (i + 2 < tleLines.length) {
            const triplet: TLE = [
              tle_cleaner(tleLines[i]),
              tle_cleaner(tleLines[i + 1]),
              tle_cleaner(tleLines[i + 2]),
            ];
            if (triplet[1] && triplet[2]) {
              tleTriplets.push(triplet);
            }
          }
        }
        setTles(tleTriplets);
      }
    };

    fetchTLEs();
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
          key="viewport"
        />
        <meta property="og:type" content="website" key="ogtype" />
        <title key="title">{websiteTitle}</title>
        <link
          rel="canonical"
          href={`https://nextjs-pr-cesium.vercel.app`}
          key="canonical"
        />
        <meta name="twitter:title" content={websiteTitle} key="twname" />
        <meta property="og:title" content={websiteTitle} key="ogtitle" />
        <meta name="description" content={websiteDescription} key="desc" />
        <meta name="og:description" content={websiteDescription} key="ogdesc" />
        <meta
          name="twitter:description"
          content={websiteDescription}
          key="twdesc"
        />
        <meta
          property="og:url"
          content={`https://nextjs-pr-cesium.vercel.app`}
          key="ogurl"
        />
        <meta
          property="og:image"
          content={`https://nextjs-pr-.vercel.app/og.png`}
          key="ogimg"
        />
        <meta
          name="twitter:image"
          content={`https://nextjs-pr-cesium.vercel.app/og.png`}
          key="twimg"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
          key="twlrgimg"
        />
        <link rel="icon" href="/favicon.ico" key="favicon" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <main>
        <CesiumWrapper TLEs={tles} />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      ssrTles: null,
    },
  };
};

export default Home;
