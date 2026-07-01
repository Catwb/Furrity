---
title: Markdown Extended Features
published: 2024-05-01
updated: 2024-11-29
description: 'Read more about Markdown features in Fuwari'
image: ''
tags: [Demo, Example, Markdown, Fuwari]
category: 'Examples/Markdown'
draft: false 
---

## Admonitions

Following types of admonitions are supported: `note` `tip` `important` `warning` `caution`

:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::

:::important
Crucial information necessary for users to succeed.
:::

:::warning
Critical content demanding immediate user attention due to potential risks.
:::

:::caution
Negative potential consequences of an action.
:::

### Basic Syntax

```markdown
:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::
```

### Custom Titles

The title of the admonition can be customized.

:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::

```markdown
:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::
```

### GitHub Syntax

> [!TIP]
> [The GitHub syntax](https://github.com/orgs/community/discussions/16925) is also supported.

```
> [!NOTE]
> The GitHub syntax is also supported.

> [!TIP]
> The GitHub syntax is also supported.
```

### Spoiler

You can add spoilers to your text. The text also supports **Markdown** syntax.

The content :spoiler[is hidden **ayyy**]!

```markdown
The content :spoiler[is hidden **ayyy**]!

```



## Stellar Tag Plugins (Migration Test)

:::box{color="blue" title="Box Example"}
A **box** container with markdown content.
:::

:::folding{color="yellow" title="Click to expand"}
Hidden content with **bold text**.
:::

:::stnote{color="green" title="Note"}
A styled note with green accent.
:::

::button{color="red" text="Click Me" url="https://example.com"}

:::poetry{title="静夜思" author="李白" date="盛唐"}
床前明月光，
疑是地上霜。
举头望明月，
低头思故乡。
:::

:::paper{title="兰亭集序" author="王羲之" date="东晋" footer="王羲之"}
永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。

群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹；又有清流激湍，映带左右，引以为流觞曲水，列坐其次。

---

## 感怀
夫人之相与，俯仰一世。或取诸怀抱，悟言一室之内；或因寄所托，放浪形骸之外。

## 兴叹
每览昔人兴感之由，若合一契，未尝不临文嗟悼，不能喻之于怀。

后之视今，亦犹今之视昔。

固知一死生为虚诞，齐彭殇为妄作。
:::

