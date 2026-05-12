/**
 * 判断code在树形数据MediumYesNo存在
 * @param {array} area 树形数据
 * @param {string | number} value 需要匹配的值
 * @param {object} options 指定的key，比如指定匹配的键为'code'，嵌套的键为'children'
 * @return {boolean} true\false
 */
export const treeCodeExist = (area: any, value: any, options: { key?: string; childrenKey?: string } = {}): boolean => {
  // 解构并设置默认options
  const { key = "code", childrenKey = "children" } = options;

  // 边界条件检查
  if (!Array.isArray(area) || !value) return false;

  return area.some((node: any) => {
    if (node[key] === value) return true;

    const children = node[childrenKey];
    if (Array.isArray(children)) {
      return treeCodeExist(children, value, options);
    }

    return false;
  });
};

/**
 * 树状结构Medium查找并返回指定Name的node的所有父node
 * @param tree - 要搜索的树状结构。
 * @param key - 指定匹配的key
 * @param keyValue - 要查找的目标nodekey值。
 * @description 函数接受one棵树、指定的key、目标nodekey值
 * @description 如果在树Medium找到目标node，函数将返回包含从根node到目标node的所有父node的数组
 * @description 如果树Medium不存在目标node，则返回 null。
 * @returns 包含目标node的所有父node的数组，如果没有找到则返回 null。
 */
export const findPathOfParentNode = (tree: any[], key: string, keyValue: string | number): any[] | null => {
  // 用于构建链表结构的路径node
  class PathNode {
    constructor(
      public node: any,
      public parent: PathNode | null
    ) {}
  }

  // 用栈代替递归（每个element包含node和父路径node）
  const stack: { node: any; parentPath: PathNode | null }[] = [];

  // 初始化栈（倒序压入以保持左子树优先）
  for (let i = tree.length - 1; i >= 0; i--) {
    stack.push({ node: tree[i], parentPath: null });
  }

  while (stack.length > 0) {
    const { node, parentPath } = stack.pop()!;
    const currentPath = new PathNode(node, parentPath);

    // 找到目标：将链表转为数组
    if (node[key] === keyValue) {
      const pathArray: any[] = [];
      let pointer: PathNode | null = currentPath;
      while (pointer !== null) {
        pathArray.unshift(pointer.node); // 反向插入生成正向路径
        pointer = pointer.parent;
      }
      return pathArray;
    }

    // 处理子node（倒序压入保证左子树优先）
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({
          node: node.children[i],
          parentPath: currentPath // 传递路径链表
        });
      }
    }
  }
  return null;
};

/**
 * 树转one维
 * @param { array } tree 树
 * @param { string } tree 转one维的条件，Example "children"
 * @returns one维数组
 */
export const arrayFlattened = (tree: any, term: string) => {
  // 防御性检查
  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }

  const result = [];
  const stack = [...tree.reverse()];

  while (stack.length) {
    const node = stack.pop();
    result.push(node);

    if (Array.isArray(node[term])) {
      for (let i = 0; i < node[term].length; i++) {
        stack.push(node[term][i]);
      }
    }
  }
  return result;
};

/**
 * 将乱序的one维数组根据parentId转化为树形结构
 * @param {Array[Object]} nodes object
 * @returns {Array[Object]} 组装好的树形结构
 */
export const buildTreeOptimized = (nodes: any): any => {
  const nodeMap = new Map(); // 哈希表存储所有node
  const roots = []; // 存储顶层node
  const duplicates = new Set(); // 检测重复ID

  // No. one次遍历: 注册所有node & 检测重复
  for (const node of nodes) {
    const id = node.id;

    // 循环引用检测
    if (node.id === node.parentId) {
      throw new Error(`Circular reference: ${node.id} -> ${node.parentId}`);
    }

    // 重复ID检测
    if (nodeMap.has(id)) {
      duplicates.add(id);
      continue;
    }

    // 初始化子node数组
    node.children = [];
    nodeMap.set(id, node);
  }

  // 输出重复警告
  if (duplicates.size > 0) {
    console.warn(`Duplicate ID detected: ${Array.from(duplicates).join(", ")}`);
  }

  // No. two次遍历: 构建树结构
  for (const node of nodes) {
    const { parentId } = node;

    // 跳过已处理的重复node
    if (duplicates.has(node.id)) continue;

    if (parentId === "0") {
      roots.push(node); // 顶层node
    } else if (parentId) {
      const parent = nodeMap.get(parentId);
      parent?.children.push(node); // 挂载子node
    } else {
      console.warn(`Standalone node ${node.id}: parentId为空`);
    }
  }

  return roots;
};

/**
 * 根据指定id递归树查到指定node
 * @param {Array[Object]} tree 树形结构
 * @param {string | number} key 指定key
 * @param {string | number} keyValue key绑定的vaue
 * @returns {Object | null} 返回查找到的node，未找到则返回null
 */
export const findCategoryById = (tree: any, key: string, keyValue: any) => {
  const stack = [...tree].reverse(); // 初始node逆序入栈

  while (stack.length > 0) {
    const node = stack.pop();
    if (node[key] === keyValue) return node;

    if (node.children?.length) {
      // 子node逆序入栈（保持原顺序遍历）
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }

  return null;
};
