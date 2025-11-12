-- 1. Enable RLS on the studies table
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows users to see their own studies
CREATE POLICY "Users can view their own studies"
ON public.studies
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Create a policy that allows users to insert their own studies
CREATE POLICY "Users can insert their own studies"
ON public.studies
FOR INSERT
WITH CHECK (auth.uid() = user_id);
