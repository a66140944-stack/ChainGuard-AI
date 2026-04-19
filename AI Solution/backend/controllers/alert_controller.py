"""
Alert-related business logic.
"""

from __future__ import annotations

import time


class AlertController:
    @staticmethod
    def get_active_alerts(shipments: list[dict]) -> list[dict]:
        alerts = [shipment for shipment in shipments if shipment.get("action", "MONITOR") != "MONITOR"]
        alerts.sort(key=lambda item: item.get("risk_score", 0.0), reverse=True)
        return alerts

    @staticmethod
    def get_stats(shipments: list[dict]) -> dict:
        total = len(shipments)
        safe = sum(1 for item in shipments if item.get("color") == "green")
        warning = sum(1 for item in shipments if item.get("color") == "yellow")
        critical = sum(1 for item in shipments if item.get("color") == "red")
        avg = round(sum(item.get("risk_score", 0.0) for item in shipments) / total, 3) if total else 0.0
        return {
            "total": total,
            "safe": safe,
            "warning": warning,
            "critical": critical,
            "avg_risk_score": avg,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
