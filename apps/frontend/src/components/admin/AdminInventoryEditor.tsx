import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Carousel } from "@material-tailwind/react";
import api from "../../api";
import GroupedItem from "../../models/groupedItem.model";

interface LookupOptions {
  types: string[];
  genders: string[];
  colors: string[];
  sizes: string[];
}

const DEFAULT_LOOKUPS: LookupOptions = {
  types: ["Hoodie"],
  genders: ["Men"],
  colors: ["Blue"],
  sizes: ["M"],
};

interface FormItem {
  id: string;
  size: string;
  price: string;
  inventory: string;
}

interface FormColor {
  id: string;
  color: string;
  imgUrls: string[];
  items: FormItem[];
}

interface FormGroupedItem {
  id: string;
  type: string;
  gender: string;
  itemColors: FormColor[];
}

const createBlankItem = (defaultSize: string): FormItem => ({
  id: "",
  size: defaultSize,
  price: "29.99",
  inventory: "10",
});

const createBlankColor = (
  defaultColor: string,
  defaultSize: string,
): FormColor => ({
  id: "",
  color: defaultColor,
  imgUrls: [],
  items: [createBlankItem(defaultSize)],
});

const createInitialForm = (lookups: LookupOptions): FormGroupedItem => ({
  id: "",
  type: lookups.types[0],
  gender: lookups.genders[0],
  itemColors: [createBlankColor(lookups.colors[0], lookups.sizes[0])],
});

const mapGroupedItemToForm = (item: GroupedItem): FormGroupedItem => ({
  id: item.id,
  type: item.type,
  gender: item.gender,
  itemColors: item.itemColors.map((itemColor) => ({
    id: itemColor.id || "",
    color: itemColor.color,
    imgUrls: [...itemColor.imgUrls],
    items: itemColor.items.map((inventoryItem) => ({
      id: inventoryItem.id || "",
      size: inventoryItem.size,
      price: String(inventoryItem.price),
      inventory: String(inventoryItem.inventory),
    })),
  })),
});

const mapFormToPayload = (form: FormGroupedItem): GroupedItem | null => {
  if (!form.id.trim() || form.itemColors.length === 0) {
    return null;
  }

  const itemColors = form.itemColors.map((itemColor) => {
    if (itemColor.imgUrls.length === 0 || itemColor.items.length === 0) {
      return null;
    }

    const items = itemColor.items.map((inventoryItem) => {
      const price = Number(inventoryItem.price);
      const inventory = Number(inventoryItem.inventory);
      if (
        Number.isNaN(price) ||
        price < 0 ||
        Number.isNaN(inventory) ||
        inventory < 0
      ) {
        return null;
      }

      return {
        id: inventoryItem.id.trim() || undefined,
        size: inventoryItem.size,
        price,
        inventory,
      };
    });

    if (items.some((item) => item === null)) {
      return null;
    }

    return {
      id: itemColor.id.trim() || undefined,
      color: itemColor.color,
      imgUrls: itemColor.imgUrls,
      items: items.filter((item): item is NonNullable<typeof item> => !!item),
    };
  });

  if (itemColors.some((itemColor) => itemColor === null)) {
    return null;
  }

  return {
    id: form.id.trim(),
    type: form.type,
    gender: form.gender,
    itemColors: itemColors.filter(
      (itemColor): itemColor is NonNullable<typeof itemColor> => !!itemColor,
    ),
  };
};

const resolveImageUrl = (imgUrl: string) => {
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
    return imgUrl;
  }
  return `/images/groupedItems/${imgUrl}`;
};

const AdminInventoryEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : "";
  const isCreate = !decodedId;
  const backHref = location.search ? `/admin${location.search}` : "/admin";

  const token = api.admin.getStoredToken();
  const [lookupOptions, setLookupOptions] = useState<LookupOptions>(DEFAULT_LOOKUPS);
  const [formData, setFormData] = useState<FormGroupedItem>(() =>
    createInitialForm(DEFAULT_LOOKUPS),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [manualImageUrl, setManualImageUrl] = useState("");

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set([...(lookupOptions.types || []), ...(formData.type ? [formData.type] : [])]),
      ),
    [lookupOptions.types, formData.type],
  );
  const genderOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...(lookupOptions.genders || []),
          ...(formData.gender ? [formData.gender] : []),
        ]),
      ),
    [lookupOptions.genders, formData.gender],
  );
  const colorOptions = useMemo(() => {
    const currentColors = formData.itemColors.map((itemColor) => itemColor.color);
    return Array.from(new Set([...(lookupOptions.colors || []), ...currentColors]));
  }, [lookupOptions.colors, formData.itemColors]);
  const sizeOptions = useMemo(() => {
    const currentSizes = formData.itemColors.flatMap((itemColor) =>
      itemColor.items.map((item) => item.size),
    );
    return Array.from(new Set([...(lookupOptions.sizes || []), ...currentSizes]));
  }, [lookupOptions.sizes, formData.itemColors]);

  const selectedColor = formData.itemColors[selectedColorIndex];
  const selectedVariant = selectedColor?.items[selectedVariantIndex];

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const lookups = await api.admin.getInventoryLookups(token);
        const normalizedLookups: LookupOptions = {
          types: lookups.types.length > 0 ? lookups.types : DEFAULT_LOOKUPS.types,
          genders: lookups.genders.length > 0 ? lookups.genders : DEFAULT_LOOKUPS.genders,
          colors: lookups.colors.length > 0 ? lookups.colors : DEFAULT_LOOKUPS.colors,
          sizes: lookups.sizes.length > 0 ? lookups.sizes : DEFAULT_LOOKUPS.sizes,
        };
        setLookupOptions(normalizedLookups);
        setFormData((prev) => ({
          ...prev,
          type: normalizedLookups.types.includes(prev.type)
            ? prev.type
            : normalizedLookups.types[0],
          gender: normalizedLookups.genders.includes(prev.gender)
            ? prev.gender
            : normalizedLookups.genders[0],
          itemColors:
            prev.itemColors.length > 0
              ? prev.itemColors.map((itemColor) => ({
                  ...itemColor,
                  color: normalizedLookups.colors.includes(itemColor.color)
                    ? itemColor.color
                    : normalizedLookups.colors[0],
                  items:
                    itemColor.items.length > 0
                      ? itemColor.items.map((item) => ({
                          ...item,
                          size: normalizedLookups.sizes.includes(item.size)
                            ? item.size
                            : normalizedLookups.sizes[0],
                        }))
                      : [createBlankItem(normalizedLookups.sizes[0])],
                }))
              : [
                  createBlankColor(
                    normalizedLookups.colors[0],
                    normalizedLookups.sizes[0],
                  ),
                ],
        }));
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setError("Admin auth is enabled on backend. Disable it for dev access.");
          return;
        }
        setError(err?.response?.data?.message || "Failed to load inventory lookup values");
      }
    };

    loadLookups();
  }, [token]);

  useEffect(() => {
    const loadById = async () => {
      if (isCreate) {
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const item = await api.admin.getInventoryById(token, decodedId);
        setFormData(mapGroupedItemToForm(item));
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setError("Admin auth is enabled on backend. Disable it for dev access.");
          return;
        }
        setError(err?.response?.data?.message || "Failed to load inventory item");
      } finally {
        setIsLoading(false);
      }
    };

    loadById();
  }, [isCreate, token, decodedId]);

  useEffect(() => {
    if (selectedColorIndex >= formData.itemColors.length) {
      setSelectedColorIndex(Math.max(0, formData.itemColors.length - 1));
      setSelectedVariantIndex(0);
      setSelectedImageIndex(0);
      return;
    }

    const color = formData.itemColors[selectedColorIndex];
    if (!color) {
      return;
    }

    if (selectedVariantIndex >= color.items.length) {
      setSelectedVariantIndex(Math.max(0, color.items.length - 1));
    }
    if (selectedImageIndex >= color.imgUrls.length) {
      setSelectedImageIndex(Math.max(0, color.imgUrls.length - 1));
    }
  }, [formData, selectedColorIndex, selectedVariantIndex, selectedImageIndex]);

  const updateSelectedColor = (updated: Partial<FormColor>) => {
    setFormData((prev) => ({
      ...prev,
      itemColors: prev.itemColors.map((itemColor, idx) =>
        idx === selectedColorIndex ? { ...itemColor, ...updated } : itemColor,
      ),
    }));
  };

  const updateSelectedVariant = (updated: Partial<FormItem>) => {
    setFormData((prev) => ({
      ...prev,
      itemColors: prev.itemColors.map((itemColor, colorIdx) => {
        if (colorIdx !== selectedColorIndex) {
          return itemColor;
        }
        return {
          ...itemColor,
          items: itemColor.items.map((item, itemIdx) =>
            itemIdx === selectedVariantIndex ? { ...item, ...updated } : item,
          ),
        };
      }),
    }));
  };

  const addColor = () => {
    setFormData((prev) => ({
      ...prev,
      itemColors: [
        ...prev.itemColors,
        createBlankColor(colorOptions[0] || "Blue", sizeOptions[0] || "M"),
      ],
    }));
    setSelectedColorIndex(formData.itemColors.length);
    setSelectedVariantIndex(0);
    setSelectedImageIndex(0);
  };

  const removeSelectedColor = () => {
    if (formData.itemColors.length <= 1) {
      setError("At least one color is required.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      itemColors: prev.itemColors.filter((_, idx) => idx !== selectedColorIndex),
    }));
  };

  const addVariant = () => {
    if (!selectedColor) {
      return;
    }
    updateSelectedColor({
      items: [...selectedColor.items, createBlankItem(sizeOptions[0] || "M")],
    });
    setSelectedVariantIndex(selectedColor.items.length);
  };

  const removeSelectedVariant = () => {
    if (!selectedColor || selectedColor.items.length <= 1) {
      setError("At least one size variant is required.");
      return;
    }
    updateSelectedColor({
      items: selectedColor.items.filter((_, idx) => idx !== selectedVariantIndex),
    });
  };

  const addManualImageUrl = () => {
    if (!selectedColor) {
      return;
    }
    const nextUrl = manualImageUrl.trim();
    if (!nextUrl) {
      return;
    }
    updateSelectedColor({ imgUrls: [...selectedColor.imgUrls, nextUrl] });
    setManualImageUrl("");
    setSelectedImageIndex(selectedColor.imgUrls.length);
  };

  const removeCurrentImage = () => {
    if (!selectedColor || selectedColor.imgUrls.length <= 1) {
      setError("At least one image is required for each color.");
      return;
    }
    const index = Math.max(0, Math.min(selectedImageIndex, selectedColor.imgUrls.length - 1));
    updateSelectedColor({
      imgUrls: selectedColor.imgUrls.filter((_, idx) => idx !== index),
    });
    setSelectedImageIndex(Math.max(0, index - 1));
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedColor) {
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => api.admin.uploadInventoryImage(token, file)),
      );
      updateSelectedColor({ imgUrls: [...selectedColor.imgUrls, ...uploads] });
      setSelectedImageIndex(selectedColor.imgUrls.length);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Admin auth is enabled on backend. Disable it for dev access.");
        return;
      }
      setError(err?.response?.data?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setMessage("");
    const payload = mapFormToPayload(formData);
    if (!payload) {
      setError(
        "Invalid form data. Ensure name is set, each color has images, and each color has at least one valid size variant.",
      );
      return;
    }

    setIsSaving(true);
    try {
      if (isCreate) {
        await api.admin.createInventory(token, payload);
      } else {
        await api.admin.updateInventory(token, decodedId, payload);
      }
      navigate(backHref);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Admin auth is enabled on backend. Disable it for dev access.");
        return;
      }
      setError(err?.response?.data?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 pb-10">
      <nav className="mb-2 text-sm text-gray-600">
        <Link className="text-blue-700 underline hover:text-blue-900" to={backHref}>
          Inventory Search
        </Link>
        <span className="mx-2">/</span>
        <span>{isCreate ? "Create Item" : "Edit Item"}</span>
      </nav>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isCreate ? "Create Inventory Item" : `Edit ${decodedId}`}</h1>
        <button className="rounded border px-3 py-2 text-sm" onClick={() => navigate(backHref)} type="button">
          Back To List
        </button>
      </div>

      {message && <p className="mb-2 text-sm text-green-700">{message}</p>}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {isLoading && <p className="mb-2 text-sm text-gray-600">Loading item...</p>}

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-5 grid gap-3 md:grid-cols-2 lg:grid-cols-12">
          <label className="block md:col-span-2 lg:col-span-6">
            <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Item Name</span>
            <input
              className="w-full rounded border p-2"
              value={formData.id}
              onChange={(event) => setFormData((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="Example: Great Lakes Hoodie"
            />
          </label>
          <label className="block md:col-span-1 lg:col-span-3">
            <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Type</span>
            <select
              className="w-full rounded border p-2"
              value={formData.type}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-1 lg:col-span-3">
            <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Gender</span>
            <select
              className="w-full rounded border p-2"
              value={formData.gender}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, gender: event.target.value }))
              }
            >
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-5 rounded-lg border bg-gray-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {formData.itemColors.map((itemColor, idx) => (
              <button
                key={`${itemColor.id}-${idx}`}
                className={`h-7 w-7 rounded-full border-2 ${
                  idx === selectedColorIndex ? "border-black" : "border-transparent"
                }`}
                style={{ backgroundColor: itemColor.color.toLowerCase() }}
                onClick={() => {
                  setSelectedColorIndex(idx);
                  setSelectedVariantIndex(0);
                  setSelectedImageIndex(0);
                }}
                type="button"
                title={itemColor.color}
              />
            ))}
            <button className="rounded border px-2 py-1 text-sm" onClick={addColor} type="button">
              Add Color
            </button>
            <button
              className="rounded border border-red-500 px-2 py-1 text-sm text-red-600"
              onClick={removeSelectedColor}
              type="button"
            >
              Remove Color
            </button>
          </div>
        </div>

        {selectedColor && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            <div className="rounded-lg border bg-gray-50 p-4 md:col-span-1 lg:col-span-7">
              <div className="mb-4 grid gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Selected Color</span>
                  <select
                    className="w-full rounded border p-2 text-sm"
                    value={selectedColor.color}
                    onChange={(event) =>
                      updateSelectedColor({ color: event.target.value })
                    }
                  >
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <div className="rounded border bg-white p-2">
                  {selectedColor.imgUrls.length > 0 ? (
                    <>
                      <div className="mx-auto w-full max-w-sm overflow-hidden rounded">
                        <Carousel
                          loop
                          key={`${selectedColorIndex}-${selectedColor.imgUrls.length}`}
                          onChange={(index) => setSelectedImageIndex(index)}
                        >
                          {selectedColor.imgUrls.map((imgUrl, idx) => (
                            <img
                              key={`${imgUrl}-${idx}`}
                              src={resolveImageUrl(imgUrl)}
                              alt={`Image ${idx + 1}`}
                              className="h-48 w-full rounded bg-gray-100 object-contain"
                            />
                          ))}
                        </Carousel>
                      </div>
                      <p className="mt-2 text-center text-xs text-gray-600">
                        Selected image: {selectedImageIndex + 1} of {selectedColor.imgUrls.length}
                      </p>
                    </>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                      No images yet
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    className="w-full rounded border border-red-500 px-3 py-2 text-sm text-red-600"
                    onClick={removeCurrentImage}
                    type="button"
                    disabled={selectedColor.imgUrls.length === 0}
                  >
                    Remove Selected Image
                  </button>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full rounded border p-2 text-sm"
                    onChange={(event) => handleUploadImages(event.target.files)}
                  />

                  <div className="grid gap-2">
                    <input
                      className="w-full rounded border p-2 text-sm"
                      value={manualImageUrl}
                      onChange={(event) => setManualImageUrl(event.target.value)}
                      placeholder="Paste image URL (https://...)"
                    />
                    <button className="rounded border px-3 py-2 text-sm" onClick={addManualImageUrl} type="button">
                      Add URL
                    </button>
                  </div>
                  {isUploading && <p className="text-sm text-gray-600">Uploading image(s)...</p>}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4 md:col-span-1 lg:col-span-5">
              <h2 className="mb-3 text-lg font-semibold">Sizes / Variants</h2>
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedColor.items.map((variant, idx) => (
                  <button
                    key={`${variant.size}-${idx}`}
                    className={`rounded border px-3 py-1 text-sm ${
                      idx === selectedVariantIndex ? "bg-blue-600 text-white" : "bg-white"
                    }`}
                    onClick={() => setSelectedVariantIndex(idx)}
                    type="button"
                  >
                    {variant.size}
                  </button>
                ))}
                <button className="rounded border px-2 py-1 text-sm" onClick={addVariant} type="button">
                  Add Size
                </button>
                <button
                  className="rounded border border-red-500 px-2 py-1 text-sm text-red-600"
                  onClick={removeSelectedVariant}
                  type="button"
                >
                  Remove Size
                </button>
              </div>

              {selectedVariant && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Size</span>
                    <select
                      className="w-full rounded border p-2 text-sm"
                      value={selectedVariant.size}
                      onChange={(event) =>
                        updateSelectedVariant({ size: event.target.value })
                      }
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Price</span>
                    <input
                      className="w-full rounded border p-2 text-sm"
                      value={selectedVariant.price}
                      onChange={(event) => updateSelectedVariant({ price: event.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase text-gray-600">Inventory</span>
                    <input
                      className="w-full rounded border p-2 text-sm"
                      value={selectedVariant.inventory}
                      onChange={(event) =>
                        updateSelectedVariant({ inventory: event.target.value })
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 border-t pt-4">
          <button
            className="rounded bg-black px-4 py-2 text-sm font-semibold text-white"
            onClick={handleSave}
            type="button"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isCreate ? "Create Item" : "Save Changes"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminInventoryEditor;
