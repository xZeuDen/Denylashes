"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getCartLineKey } from "../../lib/cart";
import { Product, ProductVariant } from "../../lib/types";

type CartItem = {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    variant?: ProductVariant | null
  ) => void;
  removeItem: (lineKey: string) => void;
  updateQty: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  notice: { title: string; message: string } | null;
  dismissNotice: () => void;
  getLineKey: (item: CartItem) => string;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "denylashes-cart";

type LegacyCartItem = {
  product: Product;
  quantity: number;
  variant?: ProductVariant | null;
};

const normalizeStoredItems = (parsed: LegacyCartItem[]): CartItem[] =>
  parsed
    .filter((item) => item?.product?.id)
    .map((item) => ({
      product: item.product,
      variant: item.variant ?? null,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null
  );
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getLineKey = useCallback(
    (item: CartItem) => getCartLineKey(item.product.id, item.variant?.id),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LegacyCartItem[];
        setItems(normalizeStoredItems(parsed));
      } catch {
        setItems([]);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (product: Product, quantity = 1, variant: ProductVariant | null = null) => {
      const lineKey = getCartLineKey(product.id, variant?.id);

      setItems((prev) => {
        const existing = prev.find(
          (item) => getCartLineKey(item.product.id, item.variant?.id) === lineKey
        );
        if (existing) {
          return prev.map((item) =>
            getCartLineKey(item.product.id, item.variant?.id) === lineKey
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, variant, quantity }];
      });

      const variantLabel = variant ? ` (${variant.length_value})` : "";
      setNotice({
        title: "Added to cart",
        message: `${product.title}${variantLabel} × ${quantity}`,
      });
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
      noticeTimerRef.current = setTimeout(() => {
        setNotice(null);
      }, 2600);
    },
    []
  );

  const removeItem = useCallback((lineKey: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => getCartLineKey(item.product.id, item.variant?.id) !== lineKey
      )
    );
  }, []);

  const updateQty = useCallback((lineKey: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        getCartLineKey(item.product.id, item.variant?.id) === lineKey
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const dismissNotice = useCallback(() => {
    setNotice(null);
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      cartCount,
      notice,
      dismissNotice,
      getLineKey,
    }),
    [items, addItem, removeItem, updateQty, clearCart, cartCount, notice, dismissNotice, getLineKey]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartContext };
export default CartProvider;
