
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Seller {
  _id: string;
  username: string;
  pincode: string;
  sku: string;
}

interface ItemData {
  _id: string;
  name: string;
  image: string;
  description: string;
  calories: number;
  protein: number;
  vitamins: { [key: string]: string };
  minerals: { [key: string]: string };
  price: number;
  discounted_price: number;
  currency: string;
  quantity: number;
  bulkPricing?: { minQuantity: number; price: number }[];
}

interface CardProps {
  _id: string;
  image: string;
  name: string;
  description: string;
  itemData: ItemData;
  seller?: Seller;
}

const Card: React.FC<CardProps> = ({ _id, image, name, description, itemData, seller }) => {
  const handleClick = () => {
    try {
      if (typeof window !== "undefined") {
        const parsedBulkPricing =
          itemData.bulkPricing?.map(bp => ({
            minQuantity: Number(bp.minQuantity),
            price: Number(bp.price),
          })) || [];

        const fullItemData = {
          ...itemData,
          _id,
          bulkPricing: parsedBulkPricing,
          seller,
        };

        sessionStorage.setItem("itemData", JSON.stringify(fullItemData));
      }
    } catch (error) {
      console.error("Error setting session storage:", error);
    }
  };

  return (
    <Link
      href={`/buyer/item/${name}`}
      onClick={handleClick}
      className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
    >
      <div className="overflow-hidden">
        <Image
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          width={400}
          height={200}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-center">{name}</h3>
        <p className="text-gray-700 text-sm text-center mt-1">{description}</p>

        <div className="mt-3 flex flex-col items-center">
          <span className="text-lg font-semibold">
            ₹{itemData.discounted_price.toLocaleString()}
            {itemData.discounted_price < itemData.price && (
              <span className="text-sm text-red-500 line-through pl-2">
                ₹{itemData.price.toLocaleString()}
              </span>
            )}
          </span>
          <p className="text-sm text-gray-600 mt-1">
            Available Quantity:{" "}
            <span className="font-medium">{itemData.quantity}</span>
          </p>
        </div>

        {/* {itemData.bulkPricing && itemData.bulkPricing.length > 0 && (
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-medium underline mb-1">Bulk Pricing:</p>
            <ul className="list-disc ml-5">
              {itemData.bulkPricing.map((bp, index) => (
                <li key={index}>
                  {bp.minQuantity}+ units: ₹{bp.price}
                </li>
              ))}
            </ul>
          </div>
        )} */}

        {seller && (
          <div className="mt-4 text-center text-sm text-gray-700 border-t pt-2">
            <p>
              <strong>Seller:</strong> {seller.username}
            </p>
            <p>
              <strong>Pincode:</strong> {seller.pincode}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Card;
