'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { INGREDIENTS } from '@/lib/constants/ingredients';

export default function FeaturedIngredients() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentIngredient = searchParams?.get('ingredient');

  const toggleIngredient = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (currentIngredient === slug) {
      params.delete('ingredient');
    } else {
      params.set('ingredient', slug);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-secondary/40 font-bold">Featured Ingredients</h3>
      </div>
      <div className="flex flex-col space-y-4 px-4">
        {INGREDIENTS.map((ingredient) => {
          const isActive = currentIngredient === ingredient.slug;
          return (
            <button
              key={ingredient.name}
              onClick={() => toggleIngredient(ingredient.slug)}
              className={`flex items-center justify-between p-4 cursor-pointer w-full text-left transition-colors border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm ${
                isActive ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-lowest hover:bg-primary/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${
                  isActive ? 'border-primary' : 'border-outline/30'
                }`}>
                  <div className={`w-2.5 h-2.5 bg-primary rounded-sm transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
                <span className={`text-sm transition-colors font-medium ${
                  isActive ? 'text-primary' : 'text-secondary/80'
                }`}>
                  {ingredient.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
