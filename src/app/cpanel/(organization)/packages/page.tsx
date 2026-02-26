"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Switch,
  addToast,
} from "@heroui/react";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  type InvestmentPackage,
} from "@/actions/investment-packages";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

const COLOR_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "warning", label: "Warning" },
  { value: "success", label: "Success" },
  { value: "danger", label: "Danger" },
];

export default function InvestmentPackagesPage() {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<InvestmentPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    features: "",
    color: "default",
    is_popular: false,
    display_order: "0",
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    const data = await getAllPackages();
    setPackages(data);
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      amount: "",
      features: "",
      color: "default",
      is_popular: false,
      display_order: (packages.length + 1).toString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: InvestmentPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      amount: pkg.amount.toString(),
      features: pkg.features.join("\n"),
      color: pkg.color,
      is_popular: pkg.is_popular,
      display_order: pkg.display_order.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount || !formData.features) {
      addToast({
        title: "Error",
        description: "Please fill all required fields",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    const packageData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      features: formData.features.split("\n").filter((f) => f.trim()),
      color: formData.color,
      is_popular: formData.is_popular,
      display_order: parseInt(formData.display_order),
    };

    const result = editingPackage
      ? await updatePackage(editingPackage.id, packageData)
      : await createPackage(packageData);

    setIsSubmitting(false);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Package ${editingPackage ? "updated" : "created"} successfully`,
        color: "success",
      });
      setIsModalOpen(false);
      loadPackages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    const result = await deletePackage(id);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Package deleted successfully",
        color: "success",
      });
      loadPackages();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await togglePackageStatus(id, !currentStatus);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Package status updated",
        color: "success",
      });
      loadPackages();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investment Packages</h1>
          <p className="text-default-500 text-sm mt-1">
            Manage deposit packages and pricing tiers
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={handleOpenCreate}
        >
          Create Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardBody className="animate-pulse bg-default-100" />
            </Card>
          ))
        ) : packages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-default-500">
            No packages found. Create your first package.
          </div>
        ) : (
          packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`border ${pkg.is_popular ? "border-amber-500/50" : "border-default-200"}`}
            >
              <CardBody className="gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      ${pkg.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {pkg.is_popular && (
                      <Chip color="warning" size="sm" variant="flat">
                        Popular
                      </Chip>
                    )}
                    <Chip
                      color={pkg.is_active ? "success" : "default"}
                      size="sm"
                      variant="flat"
                    >
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Chip>
                  </div>
                </div>

                <div className="space-y-1 mt-2 min-h-[100px]">
                  {pkg.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-default-600 flex items-start gap-2"
                    >
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-default-200">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Edit size={14} />}
                    onPress={() => handleOpenEdit(pkg)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color={pkg.is_active ? "default" : "success"}
                    onPress={() => handleToggleStatus(pkg.id, pkg.is_active)}
                    className="flex-1"
                  >
                    {pkg.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    isIconOnly
                    onPress={() => handleDelete(pkg.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingPackage ? "Edit Package" : "Create Package"}
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Package Name"
                  placeholder="e.g., Bronze, Silver, Gold"
                  value={formData.name}
                  onValueChange={(v) => setFormData({ ...formData, name: v })}
                  isRequired
                />
                <Input
                  label="Amount (USD)"
                  placeholder="1000"
                  type="number"
                  startContent={<DollarSign size={16} />}
                  value={formData.amount}
                  onValueChange={(v) => setFormData({ ...formData, amount: v })}
                  isRequired
                />
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Features (one per line)
                  </label>
                  <textarea
                    className="w-full min-h-[120px] p-3 rounded-lg bg-default-100 border border-default-200 focus:border-primary outline-none"
                    placeholder="Basic Trading Access&#10;Standard Support&#10;5% Mining Power"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                  />
                </div>
                <Select
                  label="Color Theme"
                  selectedKeys={[formData.color]}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Display Order"
                  type="number"
                  value={formData.display_order}
                  onValueChange={(v) =>
                    setFormData({ ...formData, display_order: v })
                  }
                />
                <Switch
                  isSelected={formData.is_popular}
                  onValueChange={(v) =>
                    setFormData({ ...formData, is_popular: v })
                  }
                >
                  Mark as Popular
                </Switch>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                >
                  {editingPackage ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
