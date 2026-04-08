"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitFork } from "lucide-react";
import type { Project } from "@/lib/types";

interface ForkTreeProps {
  project: Project;
  allProjects: Project[];
  className?: string;
}

interface TreeNode {
  id: string;
  title: string;
  creatorName: string;
  upvotes: number;
  children: TreeNode[];
}

/**
 * Build a tree of remix relationships.
 * The current project is the root (or its parent if it's a remix).
 */
function buildTree(rootId: string, allProjects: Project[], depth: number = 0): TreeNode | null {
  const project = allProjects.find((p) => p.id === rootId);
  if (!project) return null;

  const children = depth < 2
    ? allProjects
        .filter((p) => p.parentId === rootId)
        .map((child) => buildTree(child.id, allProjects, depth + 1))
        .filter((n): n is TreeNode => n !== null)
    : [];

  return {
    id: project.id,
    title: project.title,
    creatorName: project.creatorName,
    upvotes: project.upvotes,
    children,
  };
}

function TreeNodeCard({ node, isRoot }: { node: TreeNode; isRoot: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/project/${node.id}`}
        className={`block rounded-lg border px-3 py-2 text-center transition-all hover:border-violet-500/40 hover:bg-violet-500/5 ${
          isRoot
            ? "border-violet-500/30 bg-violet-500/10"
            : "border-white/[0.08] bg-white/[0.03]"
        }`}
        style={{ minWidth: 100, maxWidth: 140 }}
      >
        <span
          className={`block text-xs font-semibold truncate ${isRoot ? "text-violet-400" : "text-foreground"}`}
        >
          {node.title}
        </span>
        <span className="block text-[10px] text-muted-foreground/60 mt-0.5 truncate">
          {node.creatorName}
        </span>
        <span className="block text-[10px] text-muted-foreground/40 mt-0.5">
          {node.upvotes} upvotes
        </span>
      </Link>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="flex flex-col items-center mt-2">
          {/* Vertical connector */}
          <div className="w-px h-4 border-l-2 border-dashed border-white/10" />

          {/* Horizontal branch + children */}
          <div className="flex items-start gap-3">
            {node.children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Horizontal connector */}
                {node.children.length > 1 && (
                  <div
                    className="h-px border-t-2 border-dashed border-white/10"
                    style={{
                      width: 20,
                      alignSelf: i === 0 ? "flex-end" : i === node.children.length - 1 ? "flex-start" : "center",
                    }}
                  />
                )}
                <div className="w-px h-3 border-l-2 border-dashed border-white/10" />
                <TreeNodeCard node={child} isRoot={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ForkTree({ project, allProjects, className = "" }: ForkTreeProps) {
  // Find the root of the tree
  const rootId = project.parentId ?? project.id;
  const tree = buildTree(rootId, allProjects);

  // Only show if there are actual forks
  const hasRemixes = allProjects.some((p) => p.parentId === project.id);
  const isRemix = !!project.parentId;

  if (!tree || (!hasRemixes && !isRemix)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <GitFork className="size-3.5 text-fuchsia-400" />
        <span className="font-pixel text-[7px] uppercase tracking-widest text-fuchsia-400">
          Remix Guild
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {tree.children.length} fork{tree.children.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rpgui-container framed overflow-x-auto" style={{ padding: 16 }}>
        <div className="flex justify-center min-w-fit">
          <TreeNodeCard node={tree} isRoot={tree.id === project.id} />
        </div>
      </div>
    </motion.div>
  );
}
