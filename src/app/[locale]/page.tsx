import type {Route} from "next";
import {redirect} from "next/navigation";

export default function LocaleHomePage() {
  redirect("/today" as Route);
}
