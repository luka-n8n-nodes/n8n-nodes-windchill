# @luka-cat-mimi/n8n-nodes-windchill

[![CI](https://github.com/luka-n8n-nodes/n8n-nodes-windchill/actions/workflows/ci.yml/badge.svg)](https://github.com/luka-n8n-nodes/n8n-nodes-windchill/actions/workflows/ci.yml)
[![Publish](https://github.com/luka-n8n-nodes/n8n-nodes-windchill/actions/workflows/publish.yml/badge.svg)](https://github.com/luka-n8n-nodes/n8n-nodes-windchill/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@luka-cat-mimi/n8n-nodes-windchill.svg)](https://www.npmjs.com/package/@luka-cat-mimi/n8n-nodes-windchill)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)

> PTC Windchill REST Services (WRS / OData v4) n8n 社区节点，覆盖 15 个 Windchill 核心业务域与通用 OData 工具资源，内置自动分页、批次与超时控制、自动 NONCE（CSRF）处理以及 AI Agent Tool 支持。

## 安装

参考 n8n 官方文档：[Community Nodes Installation](https://docs.n8n.io/integrations/community-nodes/installation/)

1. 在 n8n 管理界面进入 **Settings -> Community Nodes**
2. 点击 **Install a community node**
3. 输入包名：`@luka-cat-mimi/n8n-nodes-windchill`
4. 确认安装并重启 / 刷新 n8n

> 本节点为自托管 n8n 社区节点（未启用 n8n Cloud 严格模式），需在自托管实例中安装使用。

## 凭证配置（Credentials）

节点支持两种凭证认证方式，可在节点顶部 **Authentication** 参数中切换：

### 1. Windchill Basic Auth API (`windchillBasicApi`)

适用于标准 HTTP Basic 认证访问 Windchill OData 服务：

| 字段 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| Base URL | 是 | `https://windchill.example.com/Windchill/servlet/odata` | Windchill OData 根地址，例如 `https://windchill.example.com/Windchill/servlet/odata` |
| API Version | 否 | 空 | 可选默认 API 版本（如 `v5`、`v6`），留空使用服务器默认版本 |
| Username | 是 | 空 | Windchill 登录用户名 |
| Password | 是 | 空 | Windchill 登录密码 |
| Ignore SSL Issues | 否 | `false` | 自签名证书或内网测试环境可开启以跳过 SSL 证书校验 |

### 2. Windchill Token / Header API (`windchillTokenApi`)

适用于通过 API 网关、Bearer Token、SSO 代理或自定义 Cookie / Header 访问 Windchill：

| 字段 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| Base URL | 是 | `https://windchill.example.com/Windchill/servlet/odata` | Windchill OData 根地址 |
| API Version | 否 | 空 | 可选默认 API 版本（如 `v5`） |
| Header Name | 是 | `Authorization` | 携带令牌或认证信息的请求头名称 |
| Header Value | 是 | 空 | 请求头的值，例如 `Bearer {token}` |
| Extra Headers (JSON) | 否 | 空 | 可选附加请求头 JSON，例如 `{"Cookie":"JSESSIONID=..."}` |
| Ignore SSL Issues | 否 | `false` | 是否忽略 SSL 证书校验 |

> 💡 **API 版本优先级**：单次操作高级选项中的 `API Version` > 凭证中的默认 `API Version` > 服务器默认版本。

## 支持的资源范围

本节点覆盖 **15 个 Windchill OData 业务域** 以及 **1 个通用 OData 工具资源**，并启用 `usableAsTool: true` 以支持在 n8n AI Agent 中作为工具调用：

### 15 个 Windchill 业务域

| 业务域 | 资源标识 | 主要实体集与专用操作 |
| --- | --- | --- |
| 产品管理 | `ProdMgmt` | `Parts`、`ElectricalParts`、`SupplierParts`、`ManufacturerParts`、`VendorParts`、`PartContents`、`AXLEntries`、`SourcingContexts`、`ReplacementParts`、`PartAlternateLinks`、`PartSubstituteLinks`；CRUD、获取零件结构（`GetPartStructure`）、获取零件清单（`GetPartsList`）、动态结构表示与 PVZ 二进制下载、最新版本、生命周期与检入检出（`CheckOut`/`CheckIn`/`UndoCheckOut`/`Revise`/`SetState`） |
| 文档管理 | `DocMgmt` | `Documents`、`DocumentContents`、`Attachments`、`PrimaryContents`；CRUD、主内容/附件二进制下载、生命周期与检入检出 |
| CAD 文档管理 | `CADDocumentMgmt` | `CADDocuments`、`CADDocumentContents`、`PartDocAssociations`、`CADAssemblies`、`CADComponents`、`FamilyTables`、`FamilyTableInstances`；CRUD 与关联导航查询 |
| 动态文档管理 | `DynamicDocMgmt` | `DynamicDocuments`、`DynamicDocumentContents`、`Attachments`、`PrimaryContents`；CRUD 及域/实体函数与操作调用 |
| 可视化 | `Visualization` | `Representations`、`Thumbnails`、`SmallThumbnails`、`PVZFiles`；列表/详情/删除、`GetRepresentationURL`、PVZ 二进制文件下载 |
| 分类结构 | `ClfStructure` | `ClassificationNodes`、`ClassificationAttributes`、`ClassificationAttributeValues`；CRUD、获取子节点（支持分页）、父节点及分类路径 |
| 产品平台管理 | `ProdPlatformMgmt` | `OptionSets`、`Options`、`OptionGroups`、`Choices`；列表查询与详情/导航属性读取 |
| 零件清单管理 | `PartListMgmt` | `PartLists`、`PartListItems`、`PartListContents`；CRUD 及域/实体函数与操作调用 |
| 变更管理 | `ChangeMgmt` | `ChangeRequests`、`ChangeNotices`、`ChangeIssues`、`ChangeActivities`、`AffectedItems`、`ChangeContents`；CRUD、设置生命周期状态、从变更请求创建变更通知 |
| 工作流 | `Workflow` | `WorkItems`、`WorkflowProcesses`、`Activities`、`RoutingOptions`、`WorkItemSubjects`；CRUD、获取工作项列表（支持分页）、路由选项、主题对象、可重分配候选人、完成/保存/重分配工作项 |
| 事件管理 | `EventMgmt` | `EventSubscriptions`、`EventTypes`、`DeliveryChannels`；列表/详情/删除、订阅对象实例事件、订阅对象类型事件、取消订阅 |
| 用户与组织管理 | `PrincipalMgmt` | `Users`、`Groups`、`Organizations`、`Roles`、`Teams`、`TeamMembers`；CRUD 与成员/角色导航查询 |
| 数据管理 | `DataAdmin` | `Folders`、`Cabinets`、`Containers`、`Products`、`Libraries`、`Projects`、`LifeCycleStates`、`LifeCycleTemplates`、`FolderContents`；CRUD 与文件夹导航查询 |
| 公共域 | `PTC` | `Enumerations`、`NonceTokens`、`LocalizedValues`；列表查询、获取 CSRF 令牌、获取枚举值、获取本地化字符串 |
| 导航条件 | `NavCriteria` | `NavigationCriterias`、`CriteriaSpecs`；列表/详情/创建/更新/删除 |

### 通用 OData 工具资源（`OData`）

用于动态探索服务元数据或执行跨实体/自定义 OData 请求：

- **Get Service Root**：获取可用业务域列表（`GET /`）
- **Get Domain Entity Sets**：获取指定业务域下的实体集清单（`GET /{Domain}/`）
- **Get Metadata**：获取指定业务域的 EDM 元数据 CSDL XML（`GET /{Domain}/$metadata`）
- **Execute Batch**：执行原生 OData `POST /{Domain}/$batch`（`multipart/mixed`）复合请求，自动处理外层及写子请求的 CSRF_NONCE
- **Custom Request**：通用自定义 OData 请求（支持 `GET`/`POST`/`PATCH`/`PUT`/`DELETE`，`GET` 模式支持 `Return All` + `Limit` 自动分页）

## 核心特性

### 🔄 Return All 自动分页

所有列表查询及支持分页的集合操作均统一内置 **Return All** 与 **Limit** 参数：

- **Return All = `true`**：自动以每页 `100` 条（`$top=100`）循环拉取全部数据，优先跟随响应中的 `@odata.nextLink`，若无 `@odata.nextLink` 则自动递增 `$skip` 直至结果集结束，并将 `value` 数组扁平化输出。
- **Return All = `false`**：按配置的 `Limit`（范围 `1` ~ `1000`，默认 `50`）按需分页获取并精确截断返回条数。

### 🔍 OData 查询增强选项

列表与详情操作支持常用 OData v4 与 PTC Windchill 查询选项：

- `$filter`：OData 过滤表达式
- `$select`：指定返回字段，减少网络传输
- `$expand`：展开关联导航属性
- `$orderby`：结果排序
- `$count`：返回总记录数（`$count=true`）
- `PTC-WildcardSearch`：启用 Windchill 通配符搜索请求头
- `ptc.search.latestversion`：启用仅查询最新版本过滤

### 字段从哪查？

节点参数旁的 **hint**（输入框下方常驻提示）会指引「去哪查可填值」。常用入口：

| 想知道… | 用哪个操作 |
| --- | --- |
| 当前域有哪些实体集 | **OData → Get Domain Entity Sets** |
| 实体有哪些属性 / 导航属性 / Action / Function | **OData → Get Metadata**（开启摘要模式） |
| 有哪些业务域 | **OData → Get Service Root** |
| 某条记录的 OID | 本资源 **列表查询** 结果中的 `ID` 字段，或表达式 `{{ $json.ID }}` |
| `$select` / `$filter` 能写哪些字段名 | 先留空执行一次看输出字段，或查 Get Metadata |
| 生命周期状态内部值 | **DataAdmin → 列表查询 → LifeCycleStates** |
| 枚举内部名与取值 | **PTC → 列表查询 → Enumerations**，再用 **Get Enumeration Values** |
| 用户 OID | **PrincipalMgmt → 列表查询 → Users** |

大多数 OData 查询项（`$select` / `$expand` 等）**留空即使用服务端默认行为**（返回全部字段、不展开关联）。

### ⏱️ Batching + Timeout 并发与超时控制

每个操作的 **Options** 中均包含统一的并发与超时配置，适用于大批量物料/文档同步场景：

- **Timeout (ms)**：设置单次 HTTP 请求超时时间（毫秒，`0` 表示不限制），防止 Windchill 长时间响应导致工作流挂起。
- **Batching（批次控制）**：
  - **Items per Batch**：每批并发/分组处理的输入项数量（默认 `50`）。
  - **Batch Interval (ms)**：相邻批次之间的等待间隔（默认 `1000` ms），避免触发 Windchill 服务器并发瓶颈或网关限流。

### 自动 CSRF_NONCE 处理

Windchill REST Services 对写操作要求携带防 CSRF 的 `CSRF_NONCE` 请求头。本节点内置全自动 CSRF 管理：

1. **自动获取与注入**：执行 `POST`、`PATCH`、`PUT`、`DELETE` 写操作时，自动先调用 `GET /PTC/GetCSRFToken()`，读取 `NonceValue`，并按响应中的 `NonceKey`（通常为 `CSRF_NONCE`）写入请求头；同一节点执行内会复用已获取的令牌。
2. **HTTP 412 自动刷新重试**：若服务端返回 HTTP `412 Precondition Failed`（令牌过期或失效），节点会清除缓存、重新获取最新令牌并重试该请求一次。
3. **手动控制选项**：在操作高级选项中支持设置 `Manual CSRF_NONCE`（手动传入自定义令牌，不触发自动 412 重试）或开启 `Skip CSRF_NONCE`（跳过令牌获取与注入）。

## 🛠️ 本地开发

环境要求：Node.js `>= 20.15`。

```bash
npm install          # 安装依赖
npm run dev          # 启动本地 n8n 并热加载本节点
npm run lint         # 代码检查（n8n-node lint）
npm run lint:fix     # 自动修复可修复的 lint 问题
npm run build        # 构建到 dist/
npm test             # 构建后运行 test/ 下的单元测试（node:test）
```

## 🚀 CI / CD

项目使用 GitHub Actions，配置位于 `.github/workflows/`：

| 工作流 | 触发条件 | 执行内容 |
| --- | --- | --- |
| `ci.yml` | Pull Request、推送到 `main` | `npm ci` → `npm run lint` → `npm test`（含构建） |
| `publish.yml` | 推送版本 tag（如 `0.2.0`） | `npm ci` → `npm test` → `npm run release`（lint、构建并带 npm provenance 发布） |

自 2026 年 5 月 1 日起，n8n 要求社区节点必须通过 GitHub Actions 并附带 npm provenance 发布，`publish.yml` 即满足该要求。

### 发布配置（一次性）

在以下两种 npm 认证方式中任选其一：

- **OIDC Trusted Publishing（推荐）**：在 npmjs.com 的包设置 **Trusted Publishers** 中添加 GitHub Actions 发布者（Owner `luka-n8n-nodes`、仓库 `n8n-nodes-windchill`、Workflow `publish.yml`），无需配置任何密钥。该方式只能用于已存在的包，**首次发布请使用下面的 Token 方式**。
- **npm Token**：在 npmjs.com 生成具有该包读写发布权限的 Granular Access Token，并在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加名为 `NPM_TOKEN` 的 Secret。

### 发布流程

```bash
npm run release
```

该命令需在 `main` 分支、工作区干净且已关联远程分支的状态下运行。它会交互式选择版本号、生成 CHANGELOG、提交并推送 tag，本地不会直接发布到 npm；tag 推送后由 `publish.yml` 自动发布。tag 格式为不带 `v` 前缀的 `x.y.z`。

## 📝 许可证

[MIT License](./LICENSE.md)

## 🆘 支持

- 📧 邮箱：luka.cat.mimi@gmail.com
- 🐛 [问题反馈](https://github.com/luka-n8n-nodes/n8n-nodes-windchill/issues)
