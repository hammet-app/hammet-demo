"use client";

import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { DashboardAttention } from "@/lib/api/types";

export const containerVariants = {
    hidden: {},

    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export const cardVariants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    show: {
        opacity: 1, 
        y: 0,
    },
};

type AttentionSectionProps = {
  attention: DashboardAttention;

  onPendingInvitations?: () => void;
  onPendingSubmissions?: () => void;
  onCapacity?: () => void;
};

const mockDashboard: DashboardAttention = {
  pendingInvitations: 12,
  pendingSubmissions: 5,
  capacity: {
    enrolled: 278,
    maximum: 300,
  },
  term: {
    daysRemaining: 18,
  },
};

function getCapacityColor(percent: number) {
  if (percent >= 95) {
    return {
      bg: "bg-danger-light",
      text: "text-danger-dark",
      icon: AlertCircle,
      border: "border-danger",
    };
  }

  if (percent >= 80) {
    return {
      bg: "bg-warning-light",
      text: "text-warning-dark",
      icon: AlertCircle,
      border: "border-warning",
    };
  }

  return {
    bg: "bg-success-light",
    text: "text-success-dark",
    icon: CheckCircle2,
    border: "border-success",
  };
}

export function AttentionSection({
  attention = mockDashboard,
  onPendingInvitations,
  onPendingSubmissions,
  onCapacity,
}: AttentionSectionProps) {

  const capacityPercent = Math.round(
    (attention.capacity.enrolled /
      attention.capacity.maximum) *
      100
  );

  const capacityStyle =
    getCapacityColor(capacityPercent);

  const termStyle =
    attention.term.daysRemaining <= 7
      ? {
          bg: "bg-danger-light",
          text: "text-danger-dark",
        }
      : {
          bg: "bg-warning-light",
          text: "text-warning-dark",
        };

  const cards = [
    {
        id: "pendingInvitations",
        title: "Pending Invitations",
        subtitle: "Students yet to activate accounts",
        value: attention.pendingInvitations,
        icon: Users,
        bg: "bg-cyan-light",
        text: "text-cyan-dark",
        onClick: onPendingInvitations,
    },

    {
        id: "pendingSubmissions",
        title: "Pending Submissions",
        subtitle: "Awaiting review",
        value: attention.pendingSubmissions,
        icon: GraduationCap,
        bg: "bg-purple-light",
        text: "text-purple-mid",
        onClick: onPendingSubmissions,
    },

    {
        id: "capacity",
        title: "Capacity",
        subtitle: `${attention.capacity.enrolled} of ${attention.capacity.maximum} students`,
        value: `${capacityPercent}%`,
        icon: capacityStyle.icon,
        bg: capacityStyle.bg,
        text: capacityStyle.text,
        onClick: onCapacity,
    },
    ];

  return (
    <section>

      <motion.div 
        className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{
            once: true
        }}
      >
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.button
              key={card.title}
              className={`group rounded-2xl border border-border bg-bg-card
                p-5 text-left transition-all duration-200 hover:shadow-lg
                ${card.onClick ? "cursor-pointer" : "cursor-default"}
              `}
              variants={cardVariants}
              transition={{ duration: 0.35, }}
              whileHover={{ y: -4, scale: 1.02, }}

              whileTap={{ scale: 0.98, }}
              onClick={card.onClick}
            >

              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.text}
                  `}
                >
                  <Icon size={20} />
                </div>

                <span className="text-3xl font-bold text-text-primary">
                  {card.value}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold text-text-primary">
                  {card.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {card.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

    </section>
  );
}