---
title: 友链
---



# 友人帐




<div class="tag-plugin tabs">
<div class="tab-nav">
<button class="tab-btn active" data-tab="0">本站信息</button>
<button class="tab-btn" data-tab="1">友链申请</button>
<button class="tab-btn" data-tab="2">星陨之地</button>
<button class="tab-btn" data-tab="3">友链状态</button>
</div>
<div class="tab-panel active" data-tab="0">

**欢迎和我交换友链**

**博客信息：**

```TXT
名称：龙星划空
链接：https://blog.245179.xyz/
描述：人生近看是悲剧，远看是喜剧
头像：https://blog.245179.xyz/images/atiq.png
网站截图： https://blog.245179.xyz/images/web.png
```

```yaml
- name/title: 龙星划空
  site/link: https://blog.245179.xyz/
  info/description: 人生近看是悲剧，远看是喜剧
  avatar: https://blog.245179.xyz/images/atiq.png
  siteshot/screenshot: https://blog.245179.xyz/images/web.png
```

</div>
<div class="tab-panel" data-tab="1">

**友链申请条件：**

:::check{color="green" checked}
⚖️ 网站符合<b>中国大陆法律</b>
:::

:::check{color="green" checked}
👤 网站为<b>个人性质网站</b>
:::

:::check{color="green" checked}
🤝 网站已经包含了<b>我的站点信息</b>
:::

:::check{color="green" checked}
🚀 网站为<b>博客类型</b>，并且可以<b>在1分钟之内</b>加载出主页
:::

:::check{color="red"}
📟 内含<b>大量广告</b>勿扰
:::

:::check{color="red"}
🤖 <b>搬运站，采集站等</b>勿扰
:::

如果你符合申请条件，可以**在下方评论区评论**，在经过审核后会予以添加，将通过**邮件通知**。

**友链申请格式：**

```yaml
- title:
  url:
  description:
  avatar:
  screenshot(可选):
  color(可选):
```

:::folding{title="免责声明" color="yellow"}
本博客遵守中华人民共和国相关法律。本页内容仅作为方便学习而产生的快速链接的链接方式，对与友情链接中存在的链接、好文推荐链接等均为其他网站。我本人能力有限无法逐个甄别每篇文章的每个字，并无法获知是否在收录后原作者是否对链接增加了违反法律甚至其他破坏用户计算机等行为。友链网站均可能存在风险，请你须知。

**所以在我力所能及的情况下，我会包括但不限于：**

- 针对收录的博客中的绝大多数内容通过标题来鉴别是否存在有风险的内容
- 在收录的友链好文推荐中检查是否存在风险内容

**但是你在访问的时候，仍然无法避免，包括但不限于：**

1. 作者更换了超链接的指向，替换成了其他内容
2. 作者的服务器被恶意攻击、劫持、被注入恶意内容
3. 作者的域名到期，被不法分子用作他用
4. 作者修改了文章内容，增加钓鱼网站、广告等无效信息
5. 不完善的隐私保护对用户的隐私造成了侵害、泄漏

如果发现有问题，可以进行回复，如果长时间并未处理，可以联系`hualaozhe@qq.com`
:::

</div>
<div class="tab-panel" data-tab="2">

> **星陨之地**：因某些原因导致无法访问的站点。

我们期待您再次发出光芒

**所有失效博客均会留档**

| 博客 | 失效原因 | 日期 |
| ---- | -------- | ---- |
|      |          |      |

</div>
<div class="tab-panel" data-tab="3">

> Cloudflare Workers 自动检测，标红我会亲自去看看，可以访问就打上标记，长时间红就因 **“无法访问”** 而下友链。

<div id="links" style="width:100%;font-size:14px;line-height:1.4;">加载中...</div>

<script>
(async () => {
  const config = ['goodboyboy.top','someo.top','watermelonabc.top','cysi.me','wolfyang.fan','noah0932.top'];

  const regList = config.map(d => new RegExp(`(^|\\.)${d.replace(/\./g, '\\.')}$`, 'i'));

  const data = await fetch('https://cdn.245179.xyz/link-checker').then(r => r.json());
  const colors = { online: '#52c41a', offline: '#ff4d4f', timeout: '#faad14' };

  const list = data.map(item => {
    const { name, url, avatar, status, code, cost } = item;
    const host = new URL(url).hostname;
    const whitelisted = regList.some(rx => rx.test(host));

    const finalStatus = whitelisted ? 'online' : status;
    const finalCode   = whitelisted ? 200 : code;
    const finalCost   = whitelisted ? '手动检测' : (cost ? cost + 'ms' : '');
    
    const color = colors[finalStatus] || '#d9d9d9';
    return `
      <a href="${url}" target="_blank" rel="noopener" style="display:flex;align-items:center;margin:6px 0;padding:8px 10px;border:1px solid #eee;border-radius:6px;text-decoration:none;color:#333;transition:.2s">
        <img src="${avatar}" alt="${name}" style="width:32px;height:32px;border-radius:50%;margin-right:10px;object-fit:cover">
        <span style="flex:1;font-weight:500">${name}</span>
        <span style="font-size:12px;color:${color};white-space:nowrap">
          ${finalStatus} ${finalCode} ${finalCost}
        </span>
      </a>`;
  }).join('');

  document.getElementById('links').innerHTML = list;
})();
</script>

</div>
</div>
