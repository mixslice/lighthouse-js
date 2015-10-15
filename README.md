# 使用帮助

[![build status](http://gitlab.digitwalk.com/ci/projects/12/status.png?ref=master)](http://gitlab.digitwalk.com/ci/projects/12?ref=master)

## Getting Started

引入 script

```html
<script type="text/javascript">
  var _mhq = <YOUR_PROJECT_NAME>;
</script>
<script src="http://track.digitwalk.com/mh.min.js"></script>
```

追踪事件

```javascript
maihoo.track('myevent');
```

## 微信微博的数据监测

用户登录后

```javascript
var openid = <openid>    // 从微信或微博中获取openid，请自行补充
maihoo.registerSocial(openid);
maihoo.track('view');
```

微信转发

```javascript
/* 修改微信转发链接 */
wx.ready(function(){
  // 如果没有link可以用 maihoo.getShareLink()
  var share = maihoo.getShareLink(link);

  wx.onMenuShareAppMessage({
    title: 'Nysnetech | We brought you customers (NYST_APP_20150725)',
    desc: 'Nysnetech | We brought you customers (NYST_APP_20150725)',
    link: share,
    imgUrl: '',
    type: '',
    dataUrl: '',
    success: function () {
      c.track('shareMsg', { share: share });
    },
    cancel: function () {
    }
  });

  wx.onMenuShareTimeline({
    title: 'Nysnetech | We brought you customers (NYST_TM_20150725)',
    link: share,
    imgUrl: '',
    success: function () {
      c.track('shareTimeline', { share: share });
    },
    cancel: function () {
    }
  });

});
```

## API

### func: identify

如何有登录用户可以直接绑定 `id`，如无用户，则自动生成 `uuid` 写入浏览器 cookie:

```javascript
maihoo.identify(<USER_ID>);
```

### func: register

对于每次都要发送的变量可以通过 `register` 方法发送:

```javascript
maihoo.register({target: "target"});
```

### func: track

追踪事件:

```javascript
maihoo.track('myevent', params);
```

追踪 link 点击:

```javascript
maihoo.trackLinks('a', 'link');
```

### func: registerSocial

用户登录之后发送注册信息

### func: getShareLink

获取 微信/微博 转发链接