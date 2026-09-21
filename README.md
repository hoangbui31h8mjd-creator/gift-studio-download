# Gift Studio 公开下载网页

本仓库只承载静态下载页及所需视觉资源。桌面产品、个人配置、Key、素材与完整交接包不进入此仓库。安装器通过 GitHub Releases 附件分发，应用在用户电脑本地运行。

公开入口：https://hoangbui31h8mjd-creator.github.io/gift-studio-download/

## 当前记录（2026-09-22）

- 产品附件版本：0.1.1。地址、字节数、SHA256以 [releases.js](releases.js) 与 [SHA256SUMS.txt](SHA256SUMS.txt) 为准。
- Windows：Windows 10/11 x64；Mac：macOS14+ Apple Silicon，不支持Intel Mac。
- 应用内置Python、图像依赖与默认抠图模型；AI创作需要联网和使用者自己的API Key。
- Mac为ad-hoc签名、未公证；Windows未发布者签名，当前材料不提供完整Windows实机安装至导出的验收记录。文件完整性不代替目标机验证。
- 9/21已更新首页为“让直播设计，更快一步。”及AI一站完成说明；标题、字体与入场的实际内容以本仓库文件为准，不从设计副本旧README复制。

这是本次文档整理时的本地仓库状态；本次未推送或重新核验线上。产品用户确认与实际检查边界分别记录，不因为整理文档重开旧效果审核。

## 维护规则

本仓库是HTML/CSS/普通页面脚本/字体/下载元数据的唯一编辑源。相邻 gift-studio-download 只维护背景构建工具；它的 dist 由 npm run sync-preview 从这里单向生成，不手工编辑、不反向整目录覆盖。显式背景构建仅更新这里的背景bundle和相关许可，普通同步不改变本仓库。

更改安装器或重新签名时，重新核对真实附件的版本、架构、大小与SHA256。桌面发布工具必须显式传 --version 和 --channel github，生成GitHub Releases地址的releases.js与SHA256SUMS；它不上传或验证远程附件。确认真实附件可用后再更新网页。不要把本地安装包路径放到公开链接，也不要加入带长期凭据的下载URL。

本仓库没有产品后端，不部署Node/Python处理服务，不接收用户Key。仅有网页任务时不自动重打安装包；未授权发布时保留本地差异，不推送。

保留 [third-party](third-party/) 与 [shader-background.js.LEGAL.txt](shader-background.js.LEGAL.txt) 中的许可。第三方资源不因产品发布而改为自己的许可。
