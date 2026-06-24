# Joyceya Personal Portfolio

这是个人作品集网站的 GitHub Pages 静态版本。它和“百度搜索广告关键词拓词工具”是两个不同网站，请不要把两个项目的文件混在同一个仓库里。

## 本文件夹包含

- `index.html`：作品集首页，包含 About、Selected Works、新媒体账号运营预留模块、Contact。
- `project-branding.html`：Living Brand Atlas 项目页，包含 5 个品牌策划 / Campaign Strategy PDF 案例。
- `src/assets/about-joyceya.jpg`：About 页面个人照片。
- `src/assets/cases/*.pdf`：项目页嵌入展示的 5 个 PDF。
- `index.css` / `script.js`：页面样式与交互。

## 上传到 GitHub 的方式

进入 GitHub 仓库 `joyceya-personal` 后，上传这个文件夹里面的全部内容，也就是：

```text
index.html
index.css
script.js
project-branding.html
project-iris.html
project-web.html
src/
README.md
```

注意：是上传 `joyceya-personal-rebuild` 文件夹“里面”的文件，不是把 `joyceya-personal-rebuild` 这个文件夹本身作为一个子文件夹上传。

## 不要上传到这个仓库的文件

下面这些属于百度关键词工具，不属于个人作品集：

```text
server.js
package.json
styles.css
baidu-keyword-tool-github-pages/
```

如果要发布百度搜索广告关键词拓词工具，请新建另一个 GitHub 仓库，例如 `baidu-keyword-tool`，然后把关键词工具文件上传到那个仓库。

## GitHub Pages 设置

在 `joyceya-personal` 仓库里：

1. 打开 `Settings`。
2. 左侧找到 `Pages`。
3. `Build and deployment` 选择 `Deploy from a branch`。
4. Branch 选择 `main`，文件夹选择 `/root`。
5. 点击 `Save`。

发布后，个人作品集网址通常是：

```text
https://zhousongyao531-art.github.io/joyceya-personal/
```
