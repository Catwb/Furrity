// note 是 box 的别名。
//
// 两者的样式规则逐字相同，上游 Stellar 文档也写明「note 标签由 box 容器实现」。
// 这里只保留一份实现，`:::note` / `:::stnote` 继续可用（老文章不会失效），
// 渲染出来就是 box 的结构与样式，改动颜色时也只需要改 box.mjs 一处。
export { BoxComponent as NoteComponent } from "./box.mjs"
