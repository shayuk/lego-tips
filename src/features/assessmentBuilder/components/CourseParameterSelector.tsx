import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/Select';
import { Textarea } from '../../../components/Textarea';
import { useToast } from '../../../helpers/useToast';
import { courseParameterSchema, courseTypeOptions, teachingMethodOptions, classSizeOptions, facultyOptions, departmentOptions } from '../../../helpers/courseParameterSchemas';
import { AssessmentMethod } from '../lib/assessmentTypes';
import { FileDropzone, FileDropzoneProps } from '../../../components/FileDropzone';
import { Trash2, Loader, AlertCircle, FileText } from 'lucide-react';
import styles from './CourseParameterSelector.module.css';

type CourseParameterSchema = z.infer<typeof courseParameterSchema>;

export interface CourseParameterSelectorProps {
  onParametersSet: (data: CourseParameterSchema) => void;
  onAssessmentGenerated: (assessment: AssessmentMethod | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

interface UploadedFile {
  name: string;
  content: string;
}

export const CourseParameterSelector: React.FC<CourseParameterSelectorProps> = ({
  onParametersSet,
  onAssessmentGenerated,
  isLoading,
  setIsLoading
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
    register,
    reset,
  } = useForm<CourseParameterSchema>({
    resolver: zodResolver(courseParameterSchema),
    defaultValues: {
      courseName: '',
      faculty: '',
      department: '',
      courseContent: '',
      courseType: undefined,
      teachingMethod: undefined,
      classSize: undefined
    }
  });
  
  const watchedFaculty = watch('faculty');
  const watchedCourseContent = watch('courseContent');

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    setFileError(null);
    for (const file of acceptedFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFileError("File size cannot exceed 5MB.");
        toast.showError("File too large", "File size cannot exceed 5MB.");
        continue;
      }
      try {
        const content = await file.text();
        setFiles(prev => [...prev, { name: file.name, content }]);
        setValue('courseContent', (getValues('courseContent') || '') + `\n\n--- Content from ${file.name} ---\n` + content, { shouldValidate: true });
        toast.showSuccess(`File "${file.name}" uploaded successfully.`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setFileError(`Error reading file ${file.name}: ${errorMessage}`);
        toast.showError(`Error reading file`, errorMessage);
      }
    }
  }, [setValue, getValues, toast]);

  const handleRemoveFile = (fileName: string) => {
    const fileToRemove = files.find(f => f.name === fileName);
    if (fileToRemove) {
      const updatedContent = watchedCourseContent?.replace(`\n\n--- Content from ${fileName} ---\n` + fileToRemove.content, '');
      setValue('courseContent', updatedContent || '', { shouldValidate: true });
    }
    setFiles(prev => prev.filter(f => f.name !== fileName));
    toast.showInfo(`File "${fileName}" removed.`);
  };

  const onSubmit: SubmitHandler<CourseParameterSchema> = async (data) => {
    setIsLoading(true);
    onParametersSet(data);
    try {
      // This is a placeholder for the actual assessment generation logic
      // const result = await generateAssessment(data, files);
      const result = null; 
      onAssessmentGenerated(result);
      toast.showSuccess("Parameters submitted successfully!");
    } catch (error) {
      onAssessmentGenerated(null);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.showError("Failed to process parameters", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Course Details</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="courseName">Course Name</label>
              <Input id="courseName" {...register('courseName')} placeholder="e.g., Introduction to Psychology" />
              {errors.courseName && <p className={styles.errorMessage}>{errors.courseName.message}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="faculty">Faculty</label>
              <Controller
                name="faculty"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a faculty" /></SelectTrigger>
                    <SelectContent>
                      {facultyOptions.map((option: { value: string; label: string }) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.faculty && <p className={styles.errorMessage}>{errors.faculty.message}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="department">Department</label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!watchedFaculty}>
                    <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                    <SelectContent>
                      {watchedFaculty && departmentOptions[watchedFaculty as keyof typeof departmentOptions]?.map((option: { value: string; label: string }) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className={styles.errorMessage}>{errors.department.message}</p>}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Course Content</h2>
          <FileDropzone onFilesSelected={handleFileDrop} />
          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map(file => (
                <div key={file.name} className={styles.fileItem}>
                  <FileText size={16} />
                  <span>{file.name}</span>
                  <button type="button" onClick={() => handleRemoveFile(file.name)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Textarea
            {...register('courseContent')}
            placeholder="Or paste course content, syllabus, or lecture notes here..."
            className={styles.textarea}
          />
          {(errors.courseContent || fileError) && <p className={styles.errorMessage}>{errors.courseContent?.message || fileError}</p>}
        </motion.div>
      </AnimatePresence>
      
      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={styles.section}
        >
            <h2 className={styles.sectionTitle}>Pedagogical Parameters</h2>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label htmlFor="courseType">Course Type</label>
                    <Controller
                        name="courseType"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select course type" /></SelectTrigger>
                                <SelectContent>
                                    {courseTypeOptions.map((option: { value: string; label: string }) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.courseType && <p className={styles.errorMessage}>{String(errors.courseType.message)}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="teachingMethod">Teaching Method</label>
                    <Controller
                        name="teachingMethod"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select teaching method" /></SelectTrigger>
                                <SelectContent>
                                    {teachingMethodOptions.map((option: { value: string; label: string }) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.teachingMethod && <p className={styles.errorMessage}>{String(errors.teachingMethod.message)}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="classSize">Class Size</label>
                    <Controller
                        name="classSize"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select class size" /></SelectTrigger>
                                <SelectContent>
                                    {classSizeOptions.map((option: { value: string; label: string }) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.classSize && <p className={styles.errorMessage}>{String(errors.classSize.message)}</p>}
                </div>
            </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.actions}>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              Generating...
            </>
          ) : (
            'Generate Assessment'
          )}
        </Button>
      </div>
    </form>
  );
};