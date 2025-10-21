"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AnimatedText from "@/components/custom/AnimatedText";
import AnimatedSection from "@/components/custom/AnimatedSection";
import CustomButton from "@/components/custom/CustomButton";

// Product data structure matching the backend API
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  stock?: number;
  flavors?: Array<{ name: string; quantity: number }>;
  sku?: string;
};

// Product option type
type ProductOption = {
  id: string;
  title: string;
  kind: "Traditional" | "Sour" | "Sweet";
  active: boolean;
};

// Empty fallback - will show loading state instead
const fallbackProductOptions: ProductOption[] = [];

const ShopOur = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>(fallbackProductOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle the correct API response format: {products: [], pagination: {}}
        if (data && Array.isArray(data.products)) {
          const options = data.products.map((product: Product) => ({
            id: product.id,
            title: product.name,
            kind: product.category as "Traditional" | "Sour" | "Sweet",
            active: product.isActive !== false // Default to true if not specified
          }));
          setProductOptions(options);
        } else if (Array.isArray(data)) {
          // Fallback: if response is directly an array
          const options = data.map((product: Product) => ({
            id: product.id,
            title: product.name,
            kind: product.category as "Traditional" | "Sour" | "Sweet",
            active: product.isActive !== false
          }));
          setProductOptions(options);
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Request timed out. Please try again.');
          } else {
            setError('Failed to load products. Please try again later.');
          }
        } else {
          setError('Failed to load products. Please try again later.');
        }
        // Keep empty array to show error state
        setProductOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePrevious = () => {
    // Show 4 at a time; allow scrolling only if more than 4
    if (productOptions.length <= 4) return;
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, productOptions.length - 4);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const handleNext = () => {
    // Show 4 at a time; allow scrolling only if more than 4
    if (productOptions.length <= 4) return;
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, productOptions.length - 4);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const handleCheckboxChange = (index: number) => {
    if (selectedOption === index) {
      setSelectedOption(null); // Unselect if already selected
    } else {
      setSelectedOption(index);
    }
  };

  const handleBuyNow = () => {
    if (selectedOption !== null && productOptions[selectedOption]) {
      setBuyNowLoading(true);
      const selectedProduct = productOptions[selectedOption];
      // Navigate to the specific product page
      router.push(`/products/${selectedProduct.id}`);
      // Reset loading after navigation
      setTimeout(() => setBuyNowLoading(false), 1000);
    }
  };

  return (
    <section className="h-full w-full bg-white flex flex-col justify-center items-center">
      <AnimatedSection 
        className="h-fit w-full layout py-6 md:py-8 lg:py-10 px-4"
        animationType="fadeIn"
        duration={0.8}
        delay={0.4}
      >
        <AnimatedText
          text="Shop Our Licorice Ropes"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left text-black w-full md:w-2/3 lg:w-1/3"
          splitBy="word"
        />
      </AnimatedSection>
      <AnimatedSection 
        className="h-full w-full layout gap-6 md:gap-8 lg:gap-10 flex flex-col lg:flex-row justify-between items-center px-4"
        animationType="slideLeft"
        duration={1.2}
        delay={0.6}
        staggerChildren={true}
        stagger={0.15}
        staggerDirection="left"
      >
        <div className="h-full w-full lg:w-[40%] flex justify-center">
          <Image
            src="/assets/images/slider.png"
            alt="slider"
            width={750}
            height={500}
            className="w-full max-w-md md:max-w-lg lg:max-w-none"
          />
        </div>
        <div className="h-full w-full lg:w-[60%] p-4 md:p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-black py-3 md:py-5">
            3 pack $27
          </h3>
          <h5 className="text-lg md:text-xl lg:text-2xl py-2 md:py-3 text-black">
            Choose One of the following 3 packs:
          </h5>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error Loading Products</p>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Checkbox List with Sliding Animation */}
            <div className="flex-1 overflow-hidden">
              {productOptions.length === 0 && !loading && !error && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No products available</p>
                </div>
              )}
              {productOptions.length > 0 && (
                <div className="relative h-[200px] sm:h-[180px] md:h-[160px] overflow-hidden">
                  <div
                    className="transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateY(-${currentIndex * 50}px)` }}
                  >
                    {productOptions.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isDisabled = selectedOption !== null && selectedOption !== index;

                      return (
                        <div
                          key={option.id}
                          className={`flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-gray-50 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 h-[50px] mb-1
                            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            ${isSelected ? "bg-green-50 border-l-4 border-green-500" : "border-l-4 border-transparent"}
                          `}
                          onClick={() => {
                            if (!isDisabled) handleCheckboxChange(index);
                          }}
                        >
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 border-2 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                              isSelected
                                ? "border-green-500 bg-green-500 shadow-md"
                                : "border-gray-400"
                            } ${isDisabled ? "bg-gray-200" : ""}`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-sm sm:text-base md:text-sm flex-1 ${
                              isSelected
                                ? "font-semibold text-black"
                                : "text-gray-700"
                            }`}
                          >
                            {option.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Navigation Buttons - Only show if more than 4 products */}
            {productOptions.length > 4 && (
              <div className="flex flex-row md:flex-col gap-2 sm:gap-3 justify-center md:justify-start">
                <button
                  onClick={handlePrevious}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center text-white transition-all duration-200 hover:bg-secondary/80 hover:scale-105 active:scale-95 shadow-lg"
                  title="Previous products"
                  aria-label="Previous products"
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center text-white transition-all duration-200 hover:bg-secondary/80 hover:scale-105 active:scale-95 shadow-lg"
                  title="Next products"
                  aria-label="Next products"
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {/* Buy Now Button */}
          <div className="mt-8 flex justify-center">
            <CustomButton
              title={selectedOption !== null ? `Buy ${productOptions[selectedOption]?.title}` : "Select a product to continue"}
              className={`px-8 py-3 text-lg font-semibold ${
                selectedOption !== null 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={selectedOption === null || buyNowLoading}
              loading={buyNowLoading}
              loadingText="Redirecting..."
              onClick={handleBuyNow}
            />
          </div>
          
        </div>
      </AnimatedSection>
    </section>
  );
};

export default ShopOur;
