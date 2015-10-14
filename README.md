# 使用帮助

[![build status](http://gitlab.digitwalk.com/ci/projects/12/status.png?ref=master)](http://gitlab.digitwalk.com/ci/projects/12?ref=master)

引入 script:

```html
<script src="http://track.digitwalk.com/mh.min.js"></script>
```

构建 client 实例:

```javascript
var c = Client(<YOUR_PROJECT_NAME>);
```

如何有登录用户可以直接绑定 `id`，如无用户，则自动生成 `uuid` 写入浏览器 cookie:

```javascript
c.identify(<USER_ID>);
```

对于每次都要发送的变量可以通过 `register` 方法发送:

```javascript
c.register({target: "target"});
```

追踪事件:

```javascript
c.track('myevent', params);
```

TODO: 追踪 link 点击:

```javascript
c.track_links('a', 'link');
```

## 微信的数据和转发监测示例

```javascript
    /* 三个工具用来修改转发URL */
    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function updateQueryStringParameter(uri, key, value) {
      var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      var separator = uri.indexOf('?') !== -1 ? "&" : "?";
      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
      }
      else {
        return uri + separator + key + "=" + value;
      }
    }

    function removeURLParameter(url, parameter) {
      //prefer to use l.search if you have a location/link object
      var urlparts= url.split('?');
      if (urlparts.length>=2) {

          var prefix= encodeURIComponent(parameter)+'=';
          var pars= urlparts[1].split(/[&;]/g);

          //reverse iteration as may be destructive
          for (var i= pars.length; i-- > 0;) {
              //idiom for string.startsWith
              if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                  pars.splice(i, 1);
              }
          }

          url= urlparts[0]+'?'+pars.join('&');
          return url;
      } else {
          return url;
      }
    }

    /*
     * 直接从location里获取链接中的cid 与 pid
     */
    var openid = <weixin openid>                  // 从微信中获取openid，请自行补充
    var cid = getParameterByName('__cid__');
    var pid = getParameterByName('__pid__');
    var target = getParameterByName('__target__');



    /*
     * 引用监控包，指定项目名称，本次测试为PHILIP-PROJECT
     */
    var c = Client("PHILIP-PROJECT"); // 必需
    if (openid && openid.length > 0) c.identify(openid);  // 必需，如果是微信写openid,
    c.register({target: target});     // 必需，照抄
    c.track('view', {                 // 必需，照抄, 监控view的动作
                pid: pid,
                cid: cid,
                openid: openid});

    /* 修改微信转发链接 */
  	wx.ready(function(){

      var share = removeURLParameter(share, 'code');
      share = removeURLParameter(share, 'state');
      share = removeURLParameter(share, '__cid__');
      share = removeURLParameter(share, '__pid__');
      share = share.split('#')[0] + "&__cid__=" + openid + "&__pid__=" + cid;

      wx.onMenuShareAppMessage({
          title: 'Nysnetech | We brought you customers (NYST_APP_20150725)',
          desc: 'Nysnetech | We brought you customers (NYST_APP_20150725)',
          link: share,
          imgUrl: '',
          type: '',
          dataUrl: '',
          success: function () {
              c.track('shareMsg', {               // 必需，照抄
                          pid: pid,               // c.track的写法可以是任何‘key’，来区别操作
                          cid: cid,               // 比如点击button，或者打开link 等
                          openid: openid,
                          share: share});
          },
          cancel: function () {
          }
      });

      wx.onMenuShareTimeline({
          title: 'Nysnetech | We brought you customers (NYST_TM_20150725)',
          link: share,
          imgUrl: '',
          success: function () {
              c.track('shareTimeline', { // 必需，照抄
                          pid: pid,
                          cid: cid,
                          openid: openid,
                          share: share});
          },
          cancel: function () {
          }
      });

  	});
```