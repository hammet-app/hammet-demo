"use client"

import Link from "next/link";
import { motion } from "motion/react";
import { LucideIcon, ChevronRight, ArrowRight } from "lucide-react";

export type NavigationTiles = {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
}

type NavigationTilesProps = {
    actions: NavigationTiles[];
}

export function NavigationTiles({
  actions,
}: NavigationTilesProps) {
  const MotionLink = motion.create(Link)
  return(  
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
      {actions.map((action) => { 
        const Icon = action.icon; 
        return(
          <MotionLink
            key={action.href}
            href={action.href}
            whileHover={{ y: -2, }}
            whileTap={{ scale: .98 }}
            className="group rounded-2xl border border-border bg-bg-card p-5 text-left shadow-sm shadow-slate-200/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-light">
                  <action.icon size={20} className="text-purple" />
                </div>
                <div className="space-y-1">
                  <h3 
                    className="font-semibold text-text-primary"
                    style={{ fontFamily: "var(--font-head)", }}
                  >
                    {action.title}
                  </h3>

                  <p className="text-sm leading-5 text-text-secondary">
                    {action.description}
                  </p>
                </div>
              </div>
              
              <motion.div variants={{ hover: { x: 4, },}}>
                <ArrowRight size={18} className="text-text-muted" />
              </motion.div>
            </div>


          </MotionLink>
        )
      })}
    </div>
  )
}