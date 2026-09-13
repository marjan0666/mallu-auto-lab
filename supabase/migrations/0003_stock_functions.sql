-- Atomic stock decrements, called from the payment-verification and webhook
-- handlers after a Razorpay payment is captured.

create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
) returns void
language sql
security definer set search_path = public
as $$
  update public.products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
$$;

create or replace function public.decrement_variant_stock(
  p_variant_id uuid,
  p_quantity integer
) returns void
language sql
security definer set search_path = public
as $$
  update public.product_variants
  set stock = greatest(stock - p_quantity, 0)
  where id = p_variant_id;
$$;
