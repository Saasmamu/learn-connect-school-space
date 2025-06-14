export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          class_id: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          is_urgent: boolean | null
          publish_date: string | null
          title: string
        }
        Insert: {
          class_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          is_urgent?: boolean | null
          publish_date?: string | null
          title: string
        }
        Update: {
          class_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          is_urgent?: boolean | null
          publish_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_answers: {
        Row: {
          answer_text: string | null
          created_at: string
          file_url: string | null
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string | null
          submission_id: string | null
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          submission_id?: string | null
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assignment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_questions: {
        Row: {
          assignment_id: string | null
          correct_answer: string | null
          created_at: string
          id: string
          options: Json | null
          points: number | null
          question_order: number | null
          question_text: string
          question_type: string
        }
        Insert: {
          assignment_id?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          points?: number | null
          question_order?: number | null
          question_text: string
          question_type: string
        }
        Update: {
          assignment_id?: string | null
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          points?: number | null
          question_order?: number | null
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          allow_resubmission: boolean | null
          assignment_type: string | null
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          grading_mode: string | null
          id: string
          is_published: boolean | null
          is_required: boolean | null
          lesson_id: string | null
          max_points: number | null
          reference_materials: Json | null
          scheduled_release: string | null
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_resubmission?: boolean | null
          assignment_type?: string | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          grading_mode?: string | null
          id?: string
          is_published?: boolean | null
          is_required?: boolean | null
          lesson_id?: string | null
          max_points?: number | null
          reference_materials?: Json | null
          scheduled_release?: string | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_resubmission?: boolean | null
          assignment_type?: string | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          grading_mode?: string | null
          id?: string
          is_published?: boolean | null
          is_required?: boolean | null
          lesson_id?: string | null
          max_points?: number | null
          reference_materials?: Json | null
          scheduled_release?: string | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          class_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          marked_by: string | null
          notes: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          attendance_date: string
          class_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          marked_by?: string | null
          notes?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          attendance_date?: string
          class_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          marked_by?: string | null
          notes?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          description: string | null
          grade_level: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          forum_id: string | null
          id: string
          parent_post_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          forum_id?: string | null
          id?: string
          parent_post_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          forum_id?: string | null
          id?: string
          parent_post_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "forums_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assignment_id: string | null
          auto_graded: boolean | null
          feedback: string | null
          graded_at: string
          graded_by: string | null
          id: string
          max_points: number | null
          percentage: number | null
          points_earned: number | null
          student_id: string | null
          submission_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          auto_graded?: boolean | null
          feedback?: string | null
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_points?: number | null
          percentage?: number | null
          points_earned?: number | null
          student_id?: string | null
          submission_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          auto_graded?: boolean | null
          feedback?: string | null
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_points?: number | null
          percentage?: number | null
          points_earned?: number | null
          student_id?: string | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      islamic_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          is_recurring: boolean | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          is_recurring?: boolean | null
          title?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          class_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          lesson_order: number | null
          title: string
          updated_at: string
          video_content_id: string | null
          video_url: string | null
        }
        Insert: {
          class_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          lesson_order?: number | null
          title: string
          updated_at?: string
          video_content_id?: string | null
          video_url?: string | null
        }
        Update: {
          class_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          lesson_order?: number | null
          title?: string
          updated_at?: string
          video_content_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_video_content_id_fkey"
            columns: ["video_content_id"]
            isOneToOne: false
            referencedRelation: "video_content"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string | null
          related_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id?: string | null
          related_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string | null
          related_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          education_background: string | null
          email: string
          full_name: string
          id: string
          is_featured: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          social_media_links: Json | null
          specializations: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_background?: string | null
          email: string
          full_name: string
          id: string
          is_featured?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_media_links?: Json | null
          specializations?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_background?: string | null
          email?: string
          full_name?: string
          id?: string
          is_featured?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_media_links?: Json | null
          specializations?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      quran_progress: {
        Row: {
          ayah_number: number
          created_at: string
          id: string
          last_reviewed: string | null
          memorization_status: string | null
          recitation_quality: number | null
          student_id: string | null
          surah_number: number
          teacher_notes: string | null
        }
        Insert: {
          ayah_number: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          memorization_status?: string | null
          recitation_quality?: number | null
          student_id?: string | null
          surah_number: number
          teacher_notes?: string | null
        }
        Update: {
          ayah_number?: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          memorization_status?: string | null
          recitation_quality?: number | null
          student_id?: string | null
          surah_number?: number
          teacher_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quran_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          class_id: string | null
          completion_percentage: number | null
          id: string
          is_completed: boolean | null
          last_accessed: string | null
          lesson_id: string | null
          student_id: string | null
          time_spent_minutes: number | null
        }
        Insert: {
          class_id?: string | null
          completion_percentage?: number | null
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          lesson_id?: string | null
          student_id?: string | null
          time_spent_minutes?: number | null
        }
        Update: {
          class_id?: string | null
          completion_percentage?: number | null
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          lesson_id?: string | null
          student_id?: string | null
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string | null
          attempt_number: number | null
          content: string | null
          file_url: string | null
          id: string
          is_late: boolean | null
          started_at: string | null
          status: string | null
          student_id: string | null
          submitted_at: string
          time_spent_minutes: number | null
        }
        Insert: {
          assignment_id?: string | null
          attempt_number?: number | null
          content?: string | null
          file_url?: string | null
          id?: string
          is_late?: boolean | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string
          time_spent_minutes?: number | null
        }
        Update: {
          assignment_id?: string | null
          attempt_number?: number | null
          content?: string | null
          file_url?: string | null
          id?: string
          is_late?: boolean | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_classes: {
        Row: {
          assigned_at: string
          class_id: string
          id: string
          teacher_id: string
        }
        Insert: {
          assigned_at?: string
          class_id: string
          id?: string
          teacher_id: string
        }
        Update: {
          assigned_at?: string
          class_id?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_content: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          upload_status: string | null
          uploaded_by: string
          video_quality: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by: string
          video_quality?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string
          video_quality?: string | null
          video_url?: string
        }
        Relationships: []
      }
      video_playlist_items: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string | null
          sort_order: number
          video_content_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id?: string | null
          sort_order?: number
          video_content_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string | null
          sort_order?: number
          video_content_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "video_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_playlist_items_video_content_id_fkey"
            columns: ["video_content_id"]
            isOneToOne: false
            referencedRelation: "video_content"
            referencedColumns: ["id"]
          },
        ]
      }
      video_playlists: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      video_processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          processing_status: string | null
          progress_percentage: number | null
          started_at: string | null
          video_content_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_status?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          video_content_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_status?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          video_content_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_processing_jobs_video_content_id_fkey"
            columns: ["video_content_id"]
            isOneToOne: false
            referencedRelation: "video_content"
            referencedColumns: ["id"]
          },
        ]
      }
      video_watch_history: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_watched_at: string | null
          lesson_id: string | null
          user_id: string
          video_content_id: string | null
          watch_time_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          user_id: string
          video_content_id?: string | null
          watch_time_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          user_id?: string
          video_content_id?: string | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_watch_history_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_watch_history_video_content_id_fkey"
            columns: ["video_content_id"]
            isOneToOne: false
            referencedRelation: "video_content"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_submission_grade: {
        Args: { submission_uuid: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      update_video_watch_progress: {
        Args: {
          p_video_content_id: string
          p_lesson_id: string
          p_watch_time_seconds: number
          p_completed?: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "teacher", "student"],
    },
  },
} as const
