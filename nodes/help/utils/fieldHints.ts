/**
 * 节点参数提示文案常量
 * description = 「填什么 + 格式 + 留空效果」
 * hint = 「去哪查」，统一指向节点内已有操作
 */
export const FieldHints = {
	oid: '可从本资源「列表查询」结果的 ID 字段复制，或用表达式引用上游节点，如 {{ $json.ID }}',

	metadataFields:
		'不确定字段名？先留空执行一次查看输出字段，或用 OData 资源「Get Metadata」（开启摘要）查看完整属性列表',

	navigation:
		'可用导航属性见 OData 资源「Get Metadata」中对应 EntityType 的 NavigationProperty',

	entitySet: '该域全部实体集可通过 OData 资源「Get Domain Entity Sets」查看',

	actionOrFunction:
		'可用 Action / Function 名称见 OData 资源「Get Metadata」摘要中的 Actions / Functions',

	jsonBody:
		'字段结构可参考「详情查询」返回的现有记录；关联对象使用 "属性名@odata.bind": "实体集(\'OID\')"',

	lifecycleState: '可选状态值见 DataAdmin 资源「列表查询」→ LifeCycleStates',

	enumeration:
		'枚举内部名可先用 PTC 资源「列表查询」→ Enumerations 查看，再用本操作取具体取值',

	userOid: '用户 OID 可从 PrincipalMgmt 资源「列表查询」→ Users 的 ID 字段复制',

	routingOption: '可用路由名见本资源「获取路由选项 (Get Routing Options)」操作的返回结果',

	filterExamples:
		"示例：Number eq 'P001'；startswith(Name,'ABC')；State/Value eq 'RELEASED'；Number eq 'P001' and Name eq 'PartA'（字符串用单引号）",
} as const;

export const FieldDescriptions = {
	oid: 'Windchill 实体唯一标识符（OID，形如 OR:wt.part.WTPart:12345 或 VR:...）',

	select:
		'只返回指定字段，英文逗号分隔，区分大小写；留空则返回全部字段（例如 ID,Number,Name）',

	filter: `OData $filter 过滤表达式；留空则不过滤。${FieldHints.filterExamples}`,

	expand:
		'展开关联导航属性，英文逗号分隔；可嵌套如 Components($select=ID,Number)；留空则不展开',

	orderby: '排序表达式：字段名 + asc/desc，多个用逗号分隔（例如 ModifiedOn desc,Number asc）；留空则按服务端默认排序',

	entitySet: (domain: string) => `选择 ${domain} 实体集；选「自定义」可手填实体集名称`,

	customEntitySet: (domain: string) =>
		`自定义 ${domain} 实体集名称（英文，区分大小写）；留空不可提交`,

	navigation: '可选导航属性；选「无」则直接返回当前实体详情',

	customNavigation: '自定义导航属性名称（英文，区分大小写）',

	jsonBody:
		'请求体 JSON。常用标量字段可直接写；关联对象用 "@odata.bind"。留空对象 {} 表示无额外字段',

	jsonBodyUpdate: '需要更新的 JSON 字段；未出现的字段不会被修改',

	jsonBodyAction: 'OData Action 请求体 JSON 参数；无参数时可留空为 {}',

	actionName: 'OData Action 名称（如 PTC.ProdMgmt.CheckOut）；区分大小写',

	functionName:
		'OData Function 名称（可含括号参数，如 PTC.PartListMgmt.GetPartListItems()）；区分大小写',

	apiVersion: '可选覆盖凭证中配置的默认 API 版本（如 v5、v6）；一般无需填写，留空使用凭证默认值',

	skipNonce: 'Whether to skip automatic CSRF_NONCE token fetching for write operations（一般无需开启）',

	manualNonce:
		'可选手动指定 CSRF_NONCE；填写后跳过自动获取。一般无需填写，除非对接特殊网关',
} as const;
