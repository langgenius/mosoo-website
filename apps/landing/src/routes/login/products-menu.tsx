import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { ChevronDown } from "lucide-react";
import type { ReactElement } from "react";

import { t } from "@/shared/i18n";

import { productHost, PRODUCTS, PRODUCTS_TRIGGER_CLASS } from "./products";

// Loaded after the topbar's first paint (see LazyProductsMenu in topbar.tsx).
// The popup is portalled to <body>, outside the landing shell, so it carries
// its own data-theme to pick up the landing palette.
export function ProductsMenu(): ReactElement {
  return (
    <NavigationMenu.Root aria-label={t("Products")} className="hidden sm:block">
      <NavigationMenu.List className="flex">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className={PRODUCTS_TRIGGER_CLASS}>
            {t("Products")}
            <NavigationMenu.Icon className="transition-transform duration-200 ease-out group-data-[open]:rotate-180">
              <ChevronDown aria-hidden="true" className="size-3" />
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="w-[380px] max-w-[calc(100vw-32px)] p-1.5 transition-opacity duration-150 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
            <ul className="flex flex-col gap-0.5">
              {PRODUCTS.map((product) => (
                <li key={product.id}>
                  <NavigationMenu.Link
                    href={product.href}
                    className="hover:bg-paper-200/70 focus-visible:bg-paper-200/70 focus-visible:ring-ring block rounded-md px-3 py-2.5 transition-colors outline-none focus-visible:ring-2"
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="text-fg-1 text-[13.5px] font-semibold">{product.name}</span>
                      <span className="text-fg-3 font-mono text-[10.5px] tracking-[0.06em]">
                        {productHost(product)}
                      </span>
                    </span>
                    <span className="text-fg-2 mt-1 block text-[12.5px] leading-[1.5]">
                      {product.description}
                    </span>
                  </NavigationMenu.Link>
                </li>
              ))}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          data-theme="landing"
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']"
        >
          <NavigationMenu.Popup className="bg-paper-50 border-border-strong relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] rounded-lg border shadow-[var(--shadow-lg)] transition-[opacity,transform] duration-150 ease-out data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[starting-style]:opacity-0 motion-reduce:transition-none">
            <NavigationMenu.Viewport className="relative h-full w-full overflow-hidden" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
