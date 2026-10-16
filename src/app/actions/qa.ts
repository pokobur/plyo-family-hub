'use server'

import { createClient, createReadClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

// Security: Validate inputs strictly
const QAFormSchema = z.object({
  title: z.string().min(3, "タイトルは3文字以上必要です").max(100, "タイトルは100文字以内で入力してください"),
  body: z.string().min(10, "詳細は10文字以上必要です").max(2000, "詳細は2000文字以内で入力してください"),
  category: z.string().min(1, "カテゴリを選択してください"),
})

export async function createQuestion(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { message: 'ログインが必要です。' }
  }

  const rawData = {
    title: formData.get('title'),
    body: formData.get('body'),
    category: formData.get('category'),
  }

  // Security: Zod validation to prevent malformed data
  const validatedData = QAFormSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: '入力内容にエラーがあります。',
    }
  }

  // Set author name using custom display name (metadata) or email fallback
  const author = user.user_metadata?.nickname || user.email?.split('@')[0] || '匿名パパママ'

  const { data, error } = await supabase
    .from('questions')
    .insert({
      title: validatedData.data.title,
      body: validatedData.data.body,
      category: validatedData.data.category,
      author,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to insert question:', error)
    return { message: 'データベースエラーが発生しました。' }
  }

  // Invalidate cache tags
  revalidateTag('questions', 'max')
  revalidatePath('/qa')
  revalidatePath('/')
  revalidatePath('/mypage')
  
  redirect(`/qa/${data.id}`)
}

export async function getQuestions() {
  return unstable_cache(
    async () => {
      const supabase = createReadClient()
      const { data, error } = await supabase
        .from('questions')
        .select('*, answers(count), question_likes(count)')
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data.map((q: any) => ({
          ...q,
          likes: typeof q.question_likes?.[0]?.count === 'number'
            ? Math.max(q.likes || 0, q.question_likes[0].count)
            : (q.likes || 0),
        }))
      }

      // Fallback if question_likes relation is not yet migrated
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('questions')
        .select('*, answers(count)')
        .order('created_at', { ascending: false })

      if (fallbackError) {
        console.error('Error fetching questions:', fallbackError.message || fallbackError)
        return []
      }
      return fallbackData || []
    },
    ['questions'],
    { tags: ['questions'] }
  )()
}

export async function getQuestion(id: string) {
  return unstable_cache(
    async () => {
      const supabase = createReadClient()
      let { data: question, error: qError } = await supabase
        .from('questions')
        .select('*, question_likes(count)')
        .eq('id', id)
        .single()

      if (qError) {
        // Fallback if question_likes relation is not yet migrated
        const retry = await supabase
          .from('questions')
          .select('*')
          .eq('id', id)
          .single()
        question = retry.data
        qError = retry.error
      }

      if (qError || !question) {
        console.error('Error fetching question:', qError)
        return null
      }

      const normalizedQuestion = {
        ...question,
        likes: typeof question.question_likes?.[0]?.count === 'number'
          ? Math.max(question.likes || 0, question.question_likes[0].count)
          : (question.likes || 0),
      }

      const { data: answers, error: aError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .order('is_best', { ascending: false })
        .order('created_at', { ascending: true })

      if (aError) {
        console.error('Error fetching answers:', aError)
      }

      return { question: normalizedQuestion, answers: answers || [] }
    },
    ['question', id],
    { tags: [`question-${id}`] }
  )()
}

const AnswerFormSchema = z.object({
  question_id: z.string().uuid("無効な質問IDです"),
  body: z.string().min(5, "回答は5文字以上必要です").max(2000, "回答は2000文字以内で入力してください"),
})

export async function createAnswer(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, message: 'ログインが必要です。' }
  }

  const rawData = {
    question_id: formData.get('question_id'),
    body: formData.get('body'),
  }

  const validatedData = AnswerFormSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: '入力内容にエラーがあります。',
    }
  }

  // Set author name using custom display name (metadata) or email fallback
  const author = user.user_metadata?.nickname || user.email?.split('@')[0] || '匿名パパママ'

  const { error } = await supabase
    .from('answers')
    .insert({
      question_id: validatedData.data.question_id,
      body: validatedData.data.body,
      author,
      user_id: user.id
    })

  if (error) {
    console.error('Failed to insert answer:', error)
    return { success: false, message: 'データベースエラーが発生しました。' }
  }

  // Invalidate cache tags
  revalidateTag(`question-${validatedData.data.question_id}`, 'max')
  revalidateTag('questions', 'max')
  revalidatePath(`/qa/${validatedData.data.question_id}`)
  revalidatePath('/qa')
  revalidatePath('/')
  
  return { success: true, message: '回答を投稿しました！' }
}

export async function selectBestAnswer(questionId: string, answerId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('ログインが必要です。')
  }

  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('user_id')
    .eq('id', questionId)
    .single()

  if (qError || !question || question.user_id !== user.id) {
    throw new Error('ベストアンサーを選択する権限がありません。')
  }

  // Reset existing best answers for this question
  await supabase
    .from('answers')
    .update({ is_best: false })
    .eq('question_id', questionId)

  // Set selected answer as best
  const { error: updateError } = await supabase
    .from('answers')
    .update({ is_best: true })
    .eq('id', answerId)
    .eq('question_id', questionId)

  if (updateError) {
    console.error('Failed to set best answer:', updateError)
    throw new Error('ベストアンサーの更新に失敗しました。')
  }

  revalidateTag(`question-${questionId}`, 'max')
  revalidatePath(`/qa/${questionId}`)
}
