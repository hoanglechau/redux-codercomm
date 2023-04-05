import Card from "./Card";
import Link from "./Link";
import Tabs from "./Tabs";

function customizeComponents(theme) {
  return { ...Tabs(theme), ...Card(theme), ...Link(theme) };
}

export default customizeComponents;
