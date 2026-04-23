import { useState } from "react";
import type { Coupon } from "@/types/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface CouponManagerProps {
  coupons: Coupon[];
  onAddCoupon: (coupon: Omit<Coupon, "coupon_id">) => void;
  onDeleteCoupon: (couponId: string) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
}

export default function CouponManager({
  coupons,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateCoupon,
}: CouponManagerProps) {
  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, "coupon_id">>({
    coupon_code: "",
    coupon_description: "",
    expiry_date: "",
    is_active: true,
  });

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCoupon(newCoupon);
    setNewCoupon({
      coupon_code: "",
      coupon_description: "",
      expiry_date: "",
      is_active: true,
    });
  };

  const handleUpdateCoupon = (coupon: Coupon) => {
    onUpdateCoupon(coupon);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Manage Coupons</h3>
      {coupons.map((coupon) => (
        <div key={coupon.coupon_id} className="flex items-center space-x-2">
          <Input
            value={coupon.coupon_code}
            onChange={(e) =>
              handleUpdateCoupon({ ...coupon, coupon_code: e.target.value })
            }
            placeholder="Coupon Code"
          />
          <Input
            value={coupon.coupon_description}
            onChange={(e) =>
              handleUpdateCoupon({
                ...coupon,
                coupon_description: e.target.value,
              })
            }
            placeholder="Description"
          />
          <Input
            type="date"
            value={coupon.expiry_date}
            onChange={(e) =>
              handleUpdateCoupon({ ...coupon, expiry_date: e.target.value })
            }
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`active-${coupon.coupon_id}`}
              checked={coupon.is_active}
              onCheckedChange={(checked) =>
                handleUpdateCoupon({ ...coupon, is_active: checked as boolean })
              }
            />
            <Label htmlFor={`active-${coupon.coupon_id}`}>Active</Label>
          </div>
          <Button
            variant="ghost"
            onClick={() => onDeleteCoupon(coupon.coupon_id)}
          >
            <Trash2 className="text-destructive h-8 w-8" />
          </Button>
        </div>
      ))}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          value={newCoupon.coupon_code}
          onChange={(e) =>
            setNewCoupon({ ...newCoupon, coupon_code: e.target.value })
          }
          placeholder="New Coupon Code"
        />
        <Input
          value={newCoupon.coupon_description}
          onChange={(e) =>
            setNewCoupon({ ...newCoupon, coupon_description: e.target.value })
          }
          placeholder="Description"
        />
        <Input
          type="date"
          value={newCoupon.expiry_date}
          onChange={(e) =>
            setNewCoupon({ ...newCoupon, expiry_date: e.target.value })
          }
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="new-coupon-active"
            checked={newCoupon.is_active}
            onCheckedChange={(checked) =>
              setNewCoupon({ ...newCoupon, is_active: checked as boolean })
            }
          />
          <Label htmlFor="new-coupon-active">Active</Label>
        </div>
        <Button onClick={(e) => handleAddCoupon(e)}>Add Coupon</Button>
      </div>
    </div>
  );
}
