import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chainlens" },
    { name: "description", content: "The real-time explorer for Somnia blockchain" },
  ];
}

export default function Home() {
  return <Welcome />;
}
