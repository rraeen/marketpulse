"use client";

import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="border-t border-border bg-muted/30"
    >
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">MarketPulse</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Professional market insights and investment guidance for informed decision-making.
              </p>
            </div>

            {/* Legal Disclaimers */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider">Legal Disclaimers</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Investment Risk:</strong> All investments carry
                  risk. Past performance is not indicative of future results. The value of
                  investments may go down as well as up, and you may not get back the amount
                  originally invested.
                </p>
                <p>
                  <strong className="text-foreground">Not Financial Advice:</strong> The content
                  provided on this platform is for informational and educational purposes only. It
                  does not constitute financial, investment, or trading advice. Always consult with a
                  qualified financial advisor before making investment decisions.
                </p>
                <p>
                  <strong className="text-foreground">No Guarantees:</strong> We do not guarantee
                  the accuracy, completeness, or timeliness of any information provided. Market
                  conditions change rapidly, and information may become outdated.
                </p>
                <p>
                  <strong className="text-foreground">Your Responsibility:</strong> You are solely
                  responsible for your investment decisions. MarketPulse and its contributors are
                  not liable for any losses or damages arising from your use of this information.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} MarketPulse. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </motion.footer>
  );
}
