# 使用帮助

下载 `mh.min.js`，引入 script:

```html
<script src="/path/to/mh.min.js"></script>
```

构建 client 实例:

```javascript
var c = Client('PHILIP-PROJECT');
```

如何有登录用户可以直接绑定 `id`，如无用户，则自动生成 `uuid` 写入浏览器 cookie:

```javascript
c.identify(`{user_id}`);
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
