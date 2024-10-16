import { parseVueRequest, VueQuery } from "@vitejs/plugin-vue";
import {
  createTransformContext,
  generate,
  NodeTypes,
  parse,
  TemplateChildNode,
  traverseNode,
} from "@vue/compiler-dom";
import { generateTransform, MagicStringAST } from "magic-string-ast";
import { Plugin } from "vite";

const fileRegex = /\.(my-file-ext)$/;
// export function parseVueRequest(id: string): {
//   filename: string;
//   query: VueQuery;
// } {
//   const [filename, rawQuery] = id.split(`?`, 2);
//   const query = Object.fromEntries(new URLSearchParams(rawQuery)) as VueQuery;
//   if (query.vue != null) {
//     query.vue = true;
//   }
//   if (query.index != null) {
//     query.index = Number(query.index);
//   }
//   if (query.raw != null) {
//     query.raw = true;
//   }
//   if (query.url != null) {
//     query.url = true;
//   }
//   if (query.scoped != null) {
//     query.scoped = true;
//   }
//   return {
//     filename,
//     query,
//   };
// }
function transformTemplatePre(s: MagicStringAST, pre: string) {
  return (node: any) => {
    if (!pre) {
      return;
    }

    if (!(node.type === (1 satisfies NodeTypes.ELEMENT))) return;
    const cls = node.props.find((prop: any) => prop.name === "class")?.value;
    let clsStr = cls?.content;

    if (!clsStr?.length) {
      return;
    }
    clsStr.replace(/(\s+)/g, " ").split(" ");
    if (!Array.isArray(clsStr)) {
      clsStr = [clsStr];
    }
    clsStr = clsStr.map((item: string) => `${pre}${item}`).join(" ");
    cls.content = clsStr;
    s.overwrite(cls.loc.start.offset, cls.loc.end.offset, clsStr);
  };
}
export default function myPlugin(): Plugin {
  return {
    name: "kls-transform",
    enforce: "pre",

    async resolveId(source, importer, options) {
      if (!/\.vue$/.test(source)) {
        return null;
      }
    },
    load(id, options) {
      const { filename, query } = parseVueRequest(id);
      if (query.vue) {
      }
    },
    transform(code, id, options) {
      const { filename, query } = parseVueRequest(id);
      if (/\.vue$/.test(id)) {
        const root = parse(code);
        const s = new MagicStringAST(code);

        const templates = root.children.filter(
          (node) => node.tag === "template"
        );
        for (const template of templates) {
          const preClass = template.props.find(
            (prop) => prop.type === 6 && prop.name === "preClass"
          );
          const preClassValue = preClass?.value.content;

          const ctx = createTransformContext(root, {
            filename: id,
            nodeTransforms: [transformTemplatePre(s, preClassValue)],
          });
          traverseNode(template, ctx);
        }
        return generateTransform(s, id);
        // return code;
      }
    },
  };
}
