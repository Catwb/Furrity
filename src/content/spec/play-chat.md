---
title: 实时聊天
---



---

<script>
​      (function(d,t) {
​        var BASE_URL="https://app.chatwoot.com";
​        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
​        g.src=BASE_URL+"/packs/js/sdk.js";
​        g.defer = true;
​        g.async = true;
​        s.parentNode.insertBefore(g,s);
​        g.onload=function(){
​          window.chatwootSDK.run({
​            websiteToken: 'gUrmDxMRNgsoQnpSfK4WiGi4',
​            baseUrl: BASE_URL
​          })
​        }
​      })(document,"script");
​</script>

---
