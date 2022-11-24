import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Link, Text } from "theme-ui";
import styles from "../styles/Home.module.css";
import { getQuote, Data as quoteType } from "./api/quote";
import { getSpotifyData, Data as spotifyType } from "./api/spotify";

export default function Home({
  quote,
  spotifyData,
  date,
  ...props
}: {
  quote: quoteType;
  spotifyData: spotifyType;
  date: number;
}) {
  let [spotifyProgress, setProgress] = useState(spotifyData.progress);
  let [spotifyDataS, setSpotifyDataS] = useState(spotifyData);
  useEffect(() => {
    let x = setInterval(() => {
      fetch("/api/spotify")
        .then((res) => res.json())
        .then((d) => {
          date = Date.now();
          setProgress(d.progress);
          setSpotifyDataS(d);
          spotifyDataS = d;
        });
    }, 5000);
    let y = setInterval(() => {
      console.log(spotifyDataS.playing);
      if (spotifyDataS.playing && !(spotifyDataS.duration <= spotifyProgress))
        setProgress(spotifyDataS.progress + (Date.now() - date));
    }, 1000);
    return () => {
      clearInterval(x);
      clearInterval(y);
    };
  }, []);
  return (
    <Box sx={{ display: "flex", mt: "100px" }}>
      <Box
        sx={{
          mx: "auto",
          width: ["90vw", "65vw"],
          flexDirection: "column",
        }}
      >
        <Text variant="heading">Hi, I&rsquo;m Neel.</Text>
        <Text as="p" sx={{ fontStyle: "italic" }}>
          {quote.quote}
        </Text>
        <Text as="p" sx={{ fontStyle: "italic" }}>
          - {quote.author}
        </Text>
        <hr />
        {spotifyDataS.duration > 0 ? (
          <>
            <Text as="p">
              Listening on {spotifyDataS.device.name}
              {spotifyDataS.playlistName ? (
                <span>
                  {" "}to{" "}
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={spotifyDataS.playlistUrl}
                  >
                    {spotifyDataS.playlistName}
                  </Link>
                </span>
              ) : (
                ""
              )}
              :
            </Text>
            <Link
              href={spotifyDataS.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ display: "flex" }}>
                <img
                  src={spotifyDataS.albumArt}
                  width={40}
                  height={40}
                  alt={spotifyDataS.album}
                />
                <Text
                  my="auto"
                  mx="10px"
                >{`${spotifyDataS.song}, ${spotifyDataS.artist}`}</Text>
                <Text my="auto">{`${Math.floor(
                  spotifyProgress / 1000 / 60
                )}:${pad(
                  Math.floor((spotifyProgress / 1000) % 60)
                )} / ${Math.floor(spotifyDataS.duration / 1000 / 60)}:${pad(
                  Math.floor((spotifyDataS.duration / 1000) % 60)
                )}`}</Text>
              </Box>
            </Link>
          </>
        ) : (
          ""
        )}
        <Box>
          <Image src={"/hippo.png"} width={200} height={200} alt="hippo" />
        </Box>
      </Box>
    </Box>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let data = await getQuote();
  let spotifyData = await getSpotifyData();
  return {
    props: {
      quote: data,
      spotifyData: spotifyData,
      date: Date.now(),
    },
  };
}

function pad(d: number): string {
  return d < 10 ? "0" + d.toString() : d.toString();
}
