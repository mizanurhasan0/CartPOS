import React, { useEffect, useRef, useState } from 'react';
import BillDetails from '@/feature/Sales/Components/BillDetails';
import Arrow from '../../assets/Icons/arrow-down.svg?react'
import { ProductCard } from '@/components';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useFetch from '@/utils/hooks/useFetch';
import { setValue } from '@/store/Reducer/categorySlice';
import { setValue as setProduct, updateProduct,  } from '@/store/Reducer/productSlice';
import defaultCategory from '../../assets/Images/defaultCategory.png'
import { addToCart } from '@/store/Reducer/cartSlice';

const PAGE_SIZE = 24;

export default function UserSales() {
  const { cart, store, categories, products, productsPage, totalProd, totalProdPage } = useSelector((state) => ({
    categories: state.categoryStore.categories,
    products: state.productStore.products,
    productsPage: state.productStore.page,
    totalProd: state.productStore.totalDocs,
    totalProdPage: state.productStore.totalPage,
    cart: state.cartStore.cart,
    store: state.storeStore.store,
  }), shallowEqual);

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState({ first: true, more: false });
  const [scrollState, setScrollState] = useState({ left: false, right: false });
  const { get } = useFetch();
  const dispatch = useDispatch();
  const currency = store?.currency || { symbol: '$' };
  const gridRef = useRef(null);
  const sentinelRef = useRef(null);
  const chipsRef = useRef(null);
  const reqId = useRef(0);
  const debounceTimeout = useRef();

  // ---- categories: load all once, shown in one smooth scrolling row ----
  useEffect(() => {
    get('/category?paginate=true&limit=100&page=1')
      .then(({ data }) => {
        dispatch(setValue({ target: 'categories', value: data.docs }));
        dispatch(setValue({ target: 'totalDocs', value: data.totalDocs }));
      }).catch((err) => console.log(err));
  }, []);

  // ---- products: first page on filter change, next pages on scroll ----
  const query = (page) => {
    const q = [`limit=${PAGE_SIZE}`, `page=${page}`];
    if (search) q.push('search=' + encodeURIComponent(search));
    if (activeCat !== 'all') q.push('category=' + activeCat);
    return `/product?${q.join('&')}`;
  };
  const applyMeta = (data) => {
    dispatch(setProduct({ target: 'page', value: data.page }));
    dispatch(setProduct({ target: 'totalPage', value: data.totalPages }));
    dispatch(setProduct({ target: 'totalDocs', value: data.totalDocs }));
    dispatch(setProduct({ target: 'nextPage', value: data.nextPage }));
    dispatch(setProduct({ target: 'prevPage', value: data.prevPage }));
  };
  useEffect(() => {
    const id = ++reqId.current;
    setLoading({ first: true, more: false });
    get(query(1)).then(({ data }) => {
      if (id !== reqId.current) return; // a newer filter was applied
      dispatch(setProduct({ target: 'products', value: data.docs }));
      applyMeta(data);
      gridRef.current?.scrollTo({ top: 0 });
    }).catch((err) => console.log(err)).finally(() => { if (id === reqId.current) setLoading({ first: false, more: false }); });
  }, [search, activeCat]);

  const hasMore = productsPage < totalProdPage;
  const loadMore = () => {
    if (loading.first || loading.more || !hasMore) return;
    const id = reqId.current;
    setLoading({ first: false, more: true });
    get(query(productsPage + 1)).then(({ data }) => {
      if (id !== reqId.current) return;
      dispatch(updateProduct({ target: 'products', value: data.docs }));
      applyMeta(data);
    }).catch((err) => console.log(err)).finally(() => setLoading({ first: false, more: false }));
  };
  // Infinite scroll: load the next page whenever the sentinel below the grid becomes visible
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !gridRef.current) return undefined;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadMore(); }, { root: gridRef.current, rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [productsPage, totalProdPage, loading.first, loading.more, products.length]);

  // ---- category row: arrows scroll smoothly, enabled only when there is more to see ----
  const updateScrollState = () => {
    const el = chipsRef.current;
    if (!el) return;
    setScrollState({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  };
  useEffect(() => {
    updateScrollState();
    const el = chipsRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories.length]);
  const scrollChips = (dir) => {
    const el = chipsRef.current;
    el?.scrollBy({ left: dir * Math.max(el.clientWidth * 0.75, 160), behavior: 'smooth' });
  };

  function onSearchText(ev) {
    clearTimeout(debounceTimeout.current);
    const text = ev.target.value.trim();
    debounceTimeout.current = setTimeout(() => setSearch(text), 400);
  }
  function changeCategory(id, ev) {
    setActiveCat(id);
    ev?.currentTarget?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  const chip = (active) => `shrink-0 flex items-center gap-1.5 h-9 pl-1 pr-3 rounded-full border text-sm whitespace-nowrap transition active:scale-95 ${active ? 'bg-primary2 text-white border-primary2 shadow-sm' : 'border-border text-primary hover:bg-light'}`;
  const arrowBtn = 'shrink-0 p-1 rounded-full transition disabled:opacity-30 disabled:cursor-default enabled:hover:scale-110 enabled:active:scale-95';
  const itemCount = cart.reduce((n, c) => n + Number(c.quantity || 0), 0);
  const cartTotal = cart.reduce((n, c) => {
    const price = c?.item?.sellingPrice || 0;
    const line = (price - (c.percentageDiscount ? price * (c.discount / 100) : c.discount)) * c.quantity;
    return n + line + line * ((store?.taxPercent || 0) / 100);
  }, 0);

  return (
    <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] gap-4 h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-5.5rem)]">
      <div className="flex flex-col min-h-0 h-full gap-3">
        <div className="flex items-center gap-2">
          <input onChange={onSearchText} className="flex-1 h-9 rounded-full border border-border px-4 text-sm text-primary outline-none transition focus:border-primary4 focus:ring-2 focus:ring-primary3/30" placeholder="Search products" type="search" />
          <span className="hidden sm:block text-xs text-label whitespace-nowrap">{loading.first ? 'Loading…' : `Showing ${products.length} of ${totalProd || 0}`}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Scroll categories left" onClick={() => scrollChips(-1)} disabled={!scrollState.left} className={arrowBtn}>
            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 rotate-90' />
          </button>
          <div ref={chipsRef} onScroll={updateScrollState} className="flex-1 flex gap-2 overflow-x-auto scroll-smooth snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
            <button type="button" className={`${chip(activeCat === 'all')} snap-start`} onClick={(e) => changeCategory('all', e)}>
              <img src={defaultCategory} className="h-7 w-7 rounded-full object-cover" alt="" />All
            </button>
            {categories.map((ech) => (
              <button type="button" key={ech.id} title={ech.name} className={`${chip(activeCat === ech.id)} snap-start`} onClick={(e) => changeCategory(ech.id, e)}>
                <img src={ech.image ? `${import.meta.env.VITE_SERVER_URL}/file/${ech.image}` : defaultCategory} onError={(e) => { e.target.onerror = null; e.target.src = defaultCategory; }} className="h-7 w-7 rounded-full object-cover" alt="" />
                <span className="capitalize max-w-[9rem] truncate">{ech.name}</span>
              </button>
            ))}
          </div>
          <button type="button" aria-label="Scroll categories right" onClick={() => scrollChips(1)} disabled={!scrollState.right} className={arrowBtn}>
            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 -rotate-90' />
          </button>
        </div>
        <div ref={gridRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth content-start grid grid-cols-2 min-[520px]:grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] gap-2 sm:gap-3 pr-0.5">
          {loading.first
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 rounded-xl border border-border bg-light/50 animate-pulse" />)
            : products.map((ech) => <ProductCard key={ech.id} data={ech} cardHandler={(data) => dispatch(addToCart(data))} />)}
          {!loading.first && products.length === 0 && <p className="col-span-full text-center text-sm text-label py-10">No products found</p>}
          {/* infinite-scroll sentinel + footer */}
          <div ref={sentinelRef} className="col-span-full flex items-center justify-center min-h-10 text-xs text-label">
            {loading.more ? 'Loading more…' : hasMore ? <button type="button" onClick={loadMore} className="px-4 py-1.5 rounded-full border border-border hover:bg-light">Load more</button> : (products.length > 0 ? `All ${totalProd} products loaded` : '')}
          </div>
        </div>
      </div>

      <div className={`${open ? 'fixed inset-0 z-50 flex items-end bg-primary1/60 lg:static lg:block lg:bg-transparent' : 'hidden lg:block'} min-h-0 lg:h-full`} onClick={() => setOpen(false)}>
        <div className="w-full max-h-[90dvh] lg:max-h-none h-[90dvh] lg:h-full bg-white rounded-t-2xl lg:rounded-xl lg:border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <BillDetails onClose={() => setOpen(false)} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border px-4 py-2 flex items-center justify-between gap-3">
        <p className="text-sm text-primary"><span className="font-semibold">{itemCount}</span> items &middot; <span className="font-semibold text-primary2">{currency.symbol} {cartTotal.toFixed(2)}</span></p>
        <button type="button" onClick={() => setOpen(true)} className="h-9 px-5 rounded-full bg-primary2 text-white text-sm font-semibold active:scale-95">{cart.length ? 'View cart / Create bill' : 'View cart'}</button>
      </div>
    </section>
  );
}
