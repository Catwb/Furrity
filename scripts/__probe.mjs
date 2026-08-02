import { getCollection } from "astro:content";
const posts = await getCollection("posts");
const p = posts[0];
console.log("KEYS:", Object.keys(p));
console.log("has render", typeof p.render);
console.log("id:", p.id);
