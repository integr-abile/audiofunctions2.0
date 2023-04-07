import { create, all } from "mathjs";
const config = {};
const math = create(all, config);

export default ({ app }, inject) => {
  inject("math", math);
};
