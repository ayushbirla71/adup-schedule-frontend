"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Campaign } from "@/types/campaign";
import type { Coupon } from "@/types/coupon";
import { useNavigate } from "react-router-dom";
import CouponManager from "../campaign-manager";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api";
export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState();
  const [selectedClient, setSelectedClient] = useState();
  const [formData, setFormData] = useState<
    Omit<Campaign, "campaign_id" | "client_id">
  >({
    name: "",
    description: "",
    requires_phone: false,
    requires_questions: false,
    coupons: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get("/ads/clients");
        setClients(data?.clients);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    await api.post(`/campaign/create/${selectedClient}`, formData);

    // After successful submission, redirect to the campaigns list
    navigate("/campaigns");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  const handleAddCoupon = (coupon: Omit<Coupon, "coupon_id">) => {
    setFormData((prev) => ({
      ...prev,
      coupons: [
        ...prev.coupons,
        { ...coupon, coupon_id: Date.now().toString() },
      ],
    }));
  };

  const handleDeleteCoupon = (couponId: string) => {
    setFormData((prev) => ({
      ...prev,
      coupons: prev.coupons.filter((coupon) => coupon.coupon_id !== couponId),
    }));
  };

  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    setFormData((prev) => ({
      ...prev,
      coupons: prev.coupons.map((coupon) =>
        coupon.coupon_id === updatedCoupon.coupon_id ? updatedCoupon : coupon,
      ),
    }));
  };

  return (
    <div className="container  py-10 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <h1 className="text-3xl font-bold mb-6">Add New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="flex space-x-4">
          <div>
            <Label>Client</Label>

            <Select
              required
              onValueChange={(client_id) => setSelectedClient(client_id)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clients?.map((client) => (
                    <SelectItem value={client.client_id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires_phone"
            checked={formData.requires_phone}
            onCheckedChange={() => handleCheckboxChange("requires_phone")}
          />
          <Label htmlFor="requires_phone">Requires Phone</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires_questions"
            checked={formData.requires_questions}
            onCheckedChange={() => handleCheckboxChange("requires_questions")}
          />
          <Label htmlFor="requires_questions">Requires Questions</Label>
        </div>
        <CouponManager
          coupons={formData.coupons}
          onAddCoupon={handleAddCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onUpdateCoupon={handleUpdateCoupon}
        />
        <Button type="submit">Create Campaign</Button>
      </form>
    </div>
  );
}
