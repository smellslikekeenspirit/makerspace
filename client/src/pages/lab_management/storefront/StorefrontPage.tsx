import React, { useCallback, useEffect, useState } from "react";
import Page from "../../Page";
import { Button, Divider, FormGroup, Stack, Switch, Typography } from "@mui/material";
import InventoryRow from "../../../common/InventoryRow";
import SearchBar from "../../../common/SearchBar";
import InventoryItem from "../../../types/InventoryItem";
import AddToCartModal from "./AddToCartModal";
import { useImmer } from "use-immer";
import ShoppingCart from "./ShoppingCart";
import { v4 as uuidv4 } from "uuid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { gql, useMutation, useQuery } from "@apollo/client";
import RequestWrapper from "../../../common/RequestWrapper";
import { GET_INVENTORY_ITEMS } from "../../../queries/inventoryQueries";
import AdminPage from "../../AdminPage";
import Privilege from "../../../types/Privilege";
import { useCurrentUser } from "../../../common/CurrentUserProvider";

const REMOVE_INVENTORY_ITEM_AMOUNT = gql`
  mutation RemoveInventoryItemAmount($itemID: ID!, $amountToRemove: Int!) {
    removeItemAmount(itemId: $itemID, count: $amountToRemove) {
      id
    }
  }
`;

export interface ShoppingCartEntry {
  id: string;
  item: InventoryItem;
  count: number;
}

function updateLocalStorage(cart: ShoppingCartEntry[] | null) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function StorefrontPage() {
  const currentUser = useCurrentUser();

  const { loading, error, data } = useQuery(GET_INVENTORY_ITEMS);

  const [removeItemAmount] = useMutation(REMOVE_INVENTORY_ITEM_AMOUNT, {
    refetchQueries: [{ query: GET_INVENTORY_ITEMS }],
  });

  const [searchText, setSearchText] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | undefined>();
  const [addToCartCount, setAddToCartCount] = useState(0);
  const [shoppingCart, setShoppingCart] = useImmer<ShoppingCartEntry[]>([]);

  const [showInternalItems, setShowInternalItems] = useState(false);
  const [showStaffItems, setShowStaffItems] = useState(false);

  function handleShowInternalChange(e: any) {
    setShowInternalItems(!showInternalItems)
  }

  function handleShowStaffChange(e: any) {
    setShowStaffItems(!showStaffItems)
  }

  const getCartFromStorage = useCallback(() => {
    const storedCart = localStorage.getItem("cart");
    const parsedCart = storedCart && JSON.parse(storedCart);
    setShoppingCart(parsedCart || []);
  }, [setShoppingCart]);

  useEffect(() => {
    // Load the cart on page load
    getCartFromStorage();

    // Load the cart whenever localstorage changes
    window.addEventListener("storage", getCartFromStorage);
  }, [getCartFromStorage]);

  const addToShoppingCart = (item: InventoryItem, count: number) =>
    setShoppingCart((draft) => {
      draft.push({
        id: uuidv4(),
        item,
        count,
      });

      updateLocalStorage(draft);
    });

  const removeFromShoppingCart = (id: string) =>
    setShoppingCart((draft) => {
      const index = draft.findIndex((e: ShoppingCartEntry) => e.id === id);
      draft.splice(index, 1);
      updateLocalStorage(draft);
    });

  const setEntryCount = (id: string, newCount: number) =>
    setShoppingCart((draft) => {
      const index = draft.findIndex((e: ShoppingCartEntry) => e.id === id);

      const valid = newCount > 0 && newCount <= draft[index].item.count;
      if (!valid) return;

      draft[index].count = newCount;

      updateLocalStorage(draft);
    });

  const handleCheckout = async () => {
    // Calling a mutation for each item in the cart
    // Probably better to just create a mutation that
    // can handle multiple item count adjustments at once
    for (let i = 0; i < shoppingCart.length; i++) {
      await removeItemAmount({
        variables: {
          itemID: shoppingCart[i].item.id,
          amountToRemove: shoppingCart[i].count,
        },
      });
    }

    setShoppingCart(() => []);
    updateLocalStorage([]);
  };

  return (
    <RequestWrapper loading={loading} error={error}>
      <AdminPage
        title="Storefront"
        maxWidth="1250px"
        topRightAddons={
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            href="/admin/storefront/preview"
            target="_blank"
          >
            Customer view
          </Button>
        }
      >
        <ShoppingCart
          entries={shoppingCart}
          removeEntry={removeFromShoppingCart}
          setEntryCount={setEntryCount}
          emptyCart={handleCheckout}
        />

        <Stack direction={"row"} sx={{ mb: 2, mt: 8, justifyContent: "space-between" }}>
          <Typography variant="h5" component="div">
            Inventory
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <Stack direction={"row"} alignItems={"center"}>
              <Switch onChange={handleShowInternalChange}></Switch><span> Show Internal Items</span>
            </Stack>
            <Stack direction={"row"} alignItems={"center"}>
            <Switch onChange={handleShowStaffChange} disabled={currentUser.privilege != Privilege.STAFF}></Switch><span> Show Staff Only Items</span>
            </Stack>
          </Stack>
        </Stack>

        <SearchBar
          placeholder="Search inventory"
          sx={{ mb: 2, alignSelf: "flex-start" }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onClear={() => setSearchText("")}
        />

        <Stack divider={<Divider flexItem />}>
          {data?.InventoryItems?.filter((item: InventoryItem) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
            && (!showInternalItems ? item.storefrontVisible : true)
            && ((currentUser.privilege != Privilege.STAFF && showStaffItems) ? !item.staffOnly : true)
          ).map((item: InventoryItem) => (
            <InventoryRow
              item={item}
              key={item.id}
              onClick={() => {
                setShowModal(true);
                setActiveItem(item);
              }}
            />
          ))}
        </Stack>

        {activeItem && showModal && (
          <AddToCartModal
            open
            count={addToCartCount}
            setCount={setAddToCartCount}
            addToCart={() => addToShoppingCart(activeItem, addToCartCount)}
            onClose={() => setShowModal(false)}
            item={activeItem}
          />
        )}
      </AdminPage>
    </RequestWrapper>
  );
}
